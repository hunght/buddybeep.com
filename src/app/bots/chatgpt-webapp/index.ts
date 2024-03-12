import { get, get as getPath } from 'lodash-es'
import { v4 as uuidv4 } from 'uuid'
import { getImageSize } from '~app/utils/image-size'
import { ChatGPTWebModel } from '~services/user-config'
import { ChatError, ErrorCode } from '~utils/errors'
import { parseSSEResponse } from '~utils/sse'
import { AbstractBot, SendMessageParams } from '../abstract-bot'
import { getArkoseToken } from './arkose'
import { chatGPTClient } from './client'
import { ImageContent, ResponseContent, ResponsePayload } from './types'
import { createParser } from 'eventsource-parser'
import WebSocketAsPromised from 'websocket-as-promised'
import { APPSHORTNAME } from '~app/utils/consts'
import Browser from 'webextension-polyfill'
import { fetchSSE } from './fetch-sse'

function removeCitations(text: string) {
  return text.replaceAll(/\u3010\d+\u2020source\u3011/g, '')
}

function parseResponseContent(content: ResponseContent): { text?: string; image?: ImageContent } {
  if (content.content_type === 'text') {
    return { text: removeCitations(content.parts[0]) }
  }
  if (content.content_type === 'code') {
    return { text: '_' + content.text + '_' }
  }
  if (content.content_type === 'multimodal_text') {
    for (const part of content.parts) {
      if (part.content_type === 'image_asset_pointer') {
        return { image: part }
      }
    }
  }
  return {}
}

interface ConversationContext {
  conversationId: string
  lastMessageId: string
}
const getConversationTitle = (bigtext: string) => {
  let ret = bigtext.split('\n', 1)[0]
  try {
    ret = ret.split('for summarizing :')[1]
  } catch (e) {
    console.log(e)
  }
  ret = ret.split('.', 1)[0]
  try {
    ret = APPSHORTNAME + ':' + ret.split(':')[1].trim()
  } catch (e) {
    console.log(e)
    ret = APPSHORTNAME + ':' + ret.trim().slice(0, 8) + '..'
  }
  return ret
}

const countWords = (text: string) => {
  return text.trim().split(/\s+/).length
}
const renameConversationTitle = async ({
  convId,
  prompt,
  accessToken,
}: {
  convId: string
  prompt: string
  accessToken: string
}) => {
  const titl: string = getConversationTitle(prompt)
  if (accessToken) {
    setConversationProperty(accessToken, convId, { title: titl })
  }
}
async function getChatgptwssIsOpenFlag() {
  const { chatgptwssIsOpenFlag = false } = await Browser.storage.sync.get('chatgptwssIsOpenFlag')
  return chatgptwssIsOpenFlag
}

async function setChatgptwssIsOpenFlag(isOpen: boolean) {
  const { chatgptwssIsOpenFlag = false } = await Browser.storage.sync.get('chatgptwssIsOpenFlag')
  Browser.storage.sync.set({ chatgptwssIsOpenFlag: isOpen })
  return chatgptwssIsOpenFlag
}
async function request(token: string, method: string, path: string, data?: unknown) {
  return fetch(`https://chat.openai.com/backend-api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  })
}
async function setConversationProperty(token: string, conversationId: string, propertyObject: object) {
  await request(token, 'PATCH', `/conversation/${conversationId}`, propertyObject)
}
export class ChatGPTWebBot extends AbstractBot {
  private accessToken?: string
  private responseMode?: 'websocket' | 'sse'
  private conversationContext?: ConversationContext

  constructor(public model: ChatGPTWebModel) {
    super()
  }
  async generateAnswerBySSE(params: SendMessageParams, arkoseToken: string, cleanup: () => void) {
    console.debug('ChatGPTProvider:generateAnswerBySSE:', params)
    const modelName = await this.getModelName()
    console.debug('ChatGPTProvider:this.token:', this.accessToken)
    console.debug('ChatGPTProvider:modelName:', modelName)
    const accessToken = this.accessToken
    await fetchSSE('https://chat.openai.com/backend-api/conversation', {
      method: 'POST',
      signal: params.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
        'Openai-Sentinel-Arkose-Token': arkoseToken,
      },
      body: JSON.stringify({
        action: 'next',
        messages: [
          {
            id: uuidv4(),
            role: 'user',
            content: {
              content_type: 'text',
              parts: [params.prompt],
            },
          },
        ],
        model: modelName,
        conversation_id: this.conversationContext?.conversationId || undefined,
        parent_message_id: this.conversationContext?.lastMessageId || uuidv4(),
        arkose_token: arkoseToken,
        conversation_mode: { kind: 'primary_assistant' },
      }),
      onMessage(message: string) {
        console.debug('ChatGPTProvider:generateAnswerBySSE:message', message)
        if (message.includes('wss_url')) {
          // params.onEvent({ type: 'ERROR', error: new ChatError(message, ErrorCode.UNKOWN_ERROR) })
          // cleanup()
          console.error('ChatGPTProvider:generateAnswerBySSE:message', message)
          return
        }
        if (message === '[DONE]') {
          params.onEvent({ type: 'DONE' })
          cleanup()
          return
        }
        let data
        try {
          data = JSON.parse(message)
        } catch (err) {
          console.error(err)
          return
        }
        const text = data.message?.content?.parts?.[0]
        if (text) {
          if (countWords(text) == 1 && data.message?.author?.role == 'assistant') {
            if (params.prompt.indexOf('search query:') !== -1 && accessToken) {
              renameConversationTitle({
                convId: data.conversation_id,
                prompt: params.prompt,
                accessToken: accessToken,
              })
            }
          }

          params.onEvent({
            type: 'UPDATE_ANSWER',
            data: {
              text,
              messageId: data.message.id,
              parentMessageId: data.parent_message_id,
              conversationId: data.conversation_id,
            },
          })
        }
      },
    })
  }

  async setupWSS(params: SendMessageParams, wsAddress: string) {
    const accessToken = this.accessToken

    const wsp: WebSocketAsPromised = new WebSocketAsPromised(wsAddress, {
      createWebSocket: (url) => {
        const ws = new WebSocket(wsAddress, ['Sec-Websocket-Protocol', 'json.reliable.webpubsub.azure.v1'])
        ws.binaryType = 'arraybuffer'
        return ws
      },
    })
    console.log('ChatGPTProvider:setupWebsocket:wsp', wsp)

    const openListener = async () => {
      console.log('ChatGPTProvider:setupWSSopenListener::wsp.onOpen')
      await setChatgptwssIsOpenFlag(true)
    }

    let next_check_seqid = Math.round(Math.random() * 50)
    const messageListener = (message: string) => {
      const jjws = JSON.parse(message)

      const rawMessage = jjws['data'] ? jjws['data']['body'] : ''

      const finalMessageStr = atob(rawMessage)
      console.log('ChatGPTProvider:setupWebsocket:wsp.onMessage:finalMessage:', finalMessageStr)

      const parser = createParser((parent_message) => {
        console.log('ChatGPTProvider:setupWSS:createParser:parent_message', parent_message) //event=`{data:'{}',event:undefine,id=undefined,type='event'}`
        let data
        try {
          if ((parent_message['data' as keyof typeof parent_message] as string) === '[DONE]') {
            console.log('ChatGPTProvider:setupWSS:createParser:returning DONE to frontend2')
            params.onEvent({ type: 'DONE' })
            wsp.close()
            return
          } else if (parent_message['data' as keyof typeof parent_message]) {
            data = JSON.parse(parent_message['data' as keyof typeof parent_message])
            console.log('ChatGPTProvider:setupWSS:createParser:data', data)
          }
        } catch (err) {
          console.log('ChatGPTProvider:setupWSS:createParser:Error', err)
          params.onEvent({ type: 'ERROR', error: (err as any)?.message })
          wsp.close()
          return
        }
        const content = data?.message?.content as ResponseContent | undefined
        if (!content) {
          console.log('ChatGPTProvider:returning DONE to frontend3')
          params.onEvent({ type: 'DONE' })
          wsp.close()
          return
        }
        let text: string
        if (content.content_type === 'text') {
          text = content.parts[0]
          text = removeCitations(text)
        } else if (content.content_type === 'code') {
          text = '_' + content.text + '_'
        } else {
          console.log('ChatGPTProvider:returning DONE to frontend4')
          params.onEvent({ type: 'DONE' })
          wsp.close()
          return
        }
        if (text) {
          console.log('ChatGPTProvider:setupWSS:text', text)
          if (countWords(text) == 1 && data.message?.author?.role == 'assistant') {
            if (params.prompt.indexOf('search query:') !== -1 && accessToken) {
              renameConversationTitle({ convId: data.conversation_id, prompt: params.prompt, accessToken })
            }
          }

          params.onEvent({
            type: 'UPDATE_ANSWER',
            data: {
              text,
              messageId: data.message.id,
              parentMessageId: data.parent_message_id,
              conversationId: data.conversation_id,
            },
          })
        }
      })
      parser.feed(finalMessageStr)

      const sequenceId = jjws['sequenceId']
      console.log('ChatGPTProvider:doSendMessage:sequenceId:', sequenceId)
      if (sequenceId === next_check_seqid) {
        const t = {
          type: 'sequenceAck',
          sequenceId: next_check_seqid,
        }
        wsp.send(JSON.stringify(t))
        next_check_seqid += Math.round(Math.random() * 50)
      }
    }
    wsp.removeAllListeners()
    wsp.close()
    wsp.onOpen.addListener(openListener)
    wsp.onMessage.addListener(messageListener)
    wsp.onClose.removeListener(messageListener)
    wsp.open().catch(async (e) => {
      console.error('ChatGPTProvider:doSendMessage:showError:Error caught while opening ws', e)
      wsp.removeAllListeners()
      wsp.close()
      await setChatgptwssIsOpenFlag(false)
      params.onEvent({ type: 'error', message: (e as any)?.message })
    })
  }

  async registerWSS(params: SendMessageParams): Promise<string> {
    const resp = await fetch('https://chat.openai.com/backend-api/register-websocket', {
      method: 'POST',
      signal: params.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: void 0,
    })

    const respJson = await resp.json()
    return respJson.wss_url
  }
  private async getModelName(): Promise<string> {
    if (this.model === ChatGPTWebModel['GPT-4']) {
      return 'gpt-4'
    }
    return 'gpt-3.5' //gpt-3.5
  }

  private async uploadImage(image: File): Promise<ImageContent> {
    const fileId = await chatGPTClient.uploadFile(this.accessToken!, image)
    const size = await getImageSize(image)
    return {
      asset_pointer: `file-service://${fileId}`,
      width: size.width,
      height: size.height,
      size_bytes: image.size,
    }
  }

  private buildMessage(prompt: string, image?: ImageContent) {
    return {
      id: uuidv4(),
      author: { role: 'user' },
      content: image
        ? { content_type: 'multimodal_text', parts: [image, prompt] }
        : { content_type: 'text', parts: [prompt] },
    }
  }

  async doSendMessage(params: SendMessageParams) {
    if (!this.accessToken) {
      this.accessToken = await chatGPTClient.getAccessToken()
    }

    if (!this.responseMode) {
      const response = await fetch('https://chat.openai.com/backend-api/accounts/check/v4-2023-04-27', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      }).then((r) => r.json())
      this.responseMode = get(response, 'accounts.default.features', []).includes('shared_websocket')
        ? 'websocket'
        : 'sse'
    }

    const modelName = await this.getModelName()
    console.debug('Using model:', modelName)

    const arkoseToken = await getArkoseToken()

    let image: ImageContent | undefined = undefined
    if (params.image) {
      image = await this.uploadImage(params.image)
    }

    if (this.responseMode === 'websocket') {
      const cleanup = () => {}

      const regResp = await this.registerWSS(params)
      await this.setupWSS(params, regResp) // Since params change WSS have to be setup up every time
      this.generateAnswerBySSE(params, arkoseToken, cleanup)
      return
    }
    const resp = await chatGPTClient.fetch('https://chat.openai.com/backend-api/conversation', {
      method: 'POST',
      signal: params.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        action: 'next',
        messages: [this.buildMessage(params.prompt, image)],
        model: modelName,
        conversation_id: this.conversationContext?.conversationId || undefined,
        parent_message_id: this.conversationContext?.lastMessageId || uuidv4(),
        arkose_token: arkoseToken,
        conversation_mode: { kind: 'primary_assistant' },
      }),
    })

    const isFirstMessage = !this.conversationContext

    await parseSSEResponse(resp, (message) => {
      console.debug('chatgpt sse message', message)
      if (message === '[DONE]') {
        params.onEvent({ type: 'DONE' })
        return
      }
      let parsed: ResponsePayload | { message: null; error: string }
      try {
        parsed = JSON.parse(message)
      } catch (err) {
        console.error(err)
        return
      }
      if (!parsed.message && parsed.error) {
        params.onEvent({
          type: 'ERROR',
          error: new ChatError(parsed.error, ErrorCode.UNKOWN_ERROR),
        })
        return
      }

      const payload = parsed as ResponsePayload

      const role = getPath(payload, 'message.author.role')
      if (role !== 'assistant' && role !== 'tool') {
        return
      }

      const content = payload.message?.content as ResponseContent | undefined
      if (!content) {
        return
      }

      const { text } = parseResponseContent(content)
      if (text) {
        this.conversationContext = { conversationId: payload.conversation_id, lastMessageId: payload.message.id }
        params.onEvent({ type: 'UPDATE_ANSWER', data: { text } })
      }
    }).catch((err: Error) => {
      if (err.message.includes('token_expired')) {
        throw new ChatError(err.message, ErrorCode.CHATGPT_AUTH)
      }
      throw err
    })

    // auto generate title on first response
    if (isFirstMessage && this.conversationContext) {
      const c = this.conversationContext
      chatGPTClient.generateChatTitle(this.accessToken, c.conversationId, c.lastMessageId)
    }
  }

  resetConversation() {
    this.conversationContext = undefined
  }

  get name() {
    return `ChatGPT (webapp/${this.model})`
  }

  get supportsImageInput() {
    return true
  }
}
