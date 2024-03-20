import { ofetch } from 'ofetch'
import { AbstractBot, SendMessageParams } from '../abstract-bot'
import { fetchRequestParams, parseGeminiResponse } from './api'
import { ConversationContext } from '~app/types/ConversationContext'
import logger from '~utils/logger'

function generateReqId() {
  return Math.floor(Math.random() * 900000) + 100000
}

export class GeminiBot extends AbstractBot {
  private conversationContext?: ConversationContext

  async doSendMessage(params: SendMessageParams) {
    if (!this.conversationContext) {
      this.conversationContext = {
        requestParams: await fetchRequestParams(),
        contextIds: ['', '', ''],
      }
    }
    const { requestParams, contextIds } = this.conversationContext

    let imageUrl: string | undefined
    if (params.image) {
      imageUrl = await this.uploadImage(params.image)
    }

    const payload = [
      null,
      JSON.stringify([
        [params.prompt, 0, null, imageUrl ? [[[imageUrl, 1], params.image!.name]] : []],
        null,
        contextIds,
      ]),
    ]

    const resp = await ofetch(
      'https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate',
      {
        method: 'POST',
        signal: params.signal,
        query: {
          bl: requestParams.blValue,
          _reqid: generateReqId(),
          rt: 'c',
        },
        body: new URLSearchParams({
          at: requestParams.atValue!,
          'f.req': JSON.stringify(payload),
        }),
        parseResponse: (txt) => txt,
      },
    )
    const { text, ids } = parseGeminiResponse(resp)
    this.conversationContext.contextIds = ids
    params.onEvent({
      type: 'UPDATE_ANSWER',
      data: { text },
    })
    params.onEvent({ type: 'DONE' })
  }

  resetConversation() {
    this.conversationContext = undefined
  }

  get getConversationContext(): ConversationContext | undefined {
    return this.conversationContext ?? undefined
  }

  set setConversationContext(conversationContext: ConversationContext | undefined) {
    this.conversationContext = conversationContext
  }

  get supportsImageInput() {
    return true
  }

  private async uploadImage(image: File) {
    const headers = {
      'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'push-id': 'feeds/mcudyrk2a4khkz',
      'x-goog-upload-header-content-length': image.size.toString(),
      'x-goog-upload-protocol': 'resumable',
      'x-tenant-id': 'gemini-storage',
    }
    const resp = await ofetch.raw('https://content-push.googleapis.com/upload/', {
      method: 'POST',
      headers: {
        ...headers,
        'x-goog-upload-command': 'start',
      },
      body: new URLSearchParams({ [`File name: ${image.name}`]: '' }),
    })
    const uploadUrl = resp.headers.get('x-goog-upload-url')
    logger.debug('Gemini upload url', uploadUrl)
    if (!uploadUrl) {
      throw new Error('Failed to upload image')
    }
    const uploadResult = await ofetch(uploadUrl, {
      method: 'POST',
      headers: {
        ...headers,
        'x-goog-upload-command': 'upload, finalize',
        'x-goog-upload-offset': '0',
      },
      body: image,
    })
    return uploadResult as string
  }
}
