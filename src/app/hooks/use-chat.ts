import { useAtom } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'
import { trackEvent } from '~app/plausible'
import { chatFamily } from '~app/state'
import { compressImageFile } from '~app/utils/image-compression'
import { setConversationMessages } from '~services/chat-history'
import { ChatMessageModel } from '~types'
import { uuid } from '~utils'
import { ChatError } from '~utils/errors'
import { BotId } from '../bots'
import { atomWithStorage } from 'jotai/utils'
import { ChatState } from './type'
import { agents } from './agents'

const chatStateStorageAtom = atomWithStorage<Record<string, ChatState>>('chatStateStorage', {})

export function useChat(botId: BotId, agentId?: string) {
  const [storedChatState, setStoredChatState] = useAtom(chatStateStorageAtom)
  const chatAtom = useMemo(() => chatFamily({ botId }), [botId])
  const [chatState, setChatState] = useAtom(chatAtom)
  const botSlug = botId + (agentId ? `-${agentId}` : '')
  console.log(`==== storedChatState ===`)
  console.log(storedChatState)
  console.log(chatState)
  console.log('==== end log ===')
  useEffect(() => {
    const agent = agentId ? agents[agentId] : undefined
    const storedChat = storedChatState[botSlug]

    if (agent && chatState.messages.length === 0 && storedChatState && (!storedChat || storedChat.messages.length)) {
      // chat.sendMessage(agent.prompt)
    }
  }, [])

  useEffect(() => {
    const storedChat = storedChatState[botSlug]

    if (storedChat && chatState.messages.length === 0 && storedChat.messages.length > 0) {
      setChatState((draft) => {
        draft.botId = storedChat.botId
        draft.messages = storedChat.messages.map((m) => ({
          id: m.id,
          text: m.text,
          image: m.image,
          author: m.author,
        }))
        draft.bot.setcontextIds = storedChat.conversationContext.contextIds
        draft.generatingMessageId = storedChat.generatingMessageId
        draft.conversationId = storedChat.conversationId
      })
    }
  }, [chatState, storedChatState])

  const updateMessage = useCallback(
    (messageId: string, updater: (message: ChatMessageModel) => void) => {
      setChatState((draft) => {
        const message = draft.messages.find((m) => m.id === messageId)
        if (message) {
          updater(message)
        }
      })
    },
    [setChatState],
  )

  const sendMessage = useCallback(
    async (input: string, image?: File) => {
      trackEvent('send_message', { botId, withImage: !!image, name: chatState.bot.name })

      const botMessageId = uuid()
      setChatState((draft) => {
        draft.messages.push(
          { id: uuid(), text: input, image, author: 'user' },
          { id: botMessageId, text: '', author: botId },
        )
      })

      const abortController = new AbortController()
      setChatState((draft) => {
        draft.generatingMessageId = botMessageId
        draft.abortController = abortController
      })

      let compressedImage: File | undefined = undefined
      if (image) {
        compressedImage = await compressImageFile(image)
      }

      const resp = await chatState.bot.sendMessage({
        prompt: input,
        image: compressedImage,
        signal: abortController.signal,
      })

      try {
        for await (const answer of resp) {
          updateMessage(botMessageId, (message) => {
            message.text = answer.text
          })
          if (chatState.messages.length === 0) {
            return
          }
          const messages = chatState.messages.map((m) => ({
            id: m.id,
            text: m.text,
            image: m.image,
            error: m.error?.code,
            author: m.author,
          }))

          const mychat: ChatState = {
            botId: chatState.botId,
            messages: messages,

            generatingMessageId: chatState.generatingMessageId,
            conversationId: chatState.conversationId,
            conversationContext: { contextIds: chatState.bot.contextIds },
          }

          setStoredChatState((prevState) => ({
            ...prevState,
            [botSlug]: mychat,
          }))
        }
      } catch (err: unknown) {
        if (!abortController.signal.aborted) {
          abortController.abort()
        }
        const error = err as ChatError
        console.error('sendMessage error', error.code, error)
        updateMessage(botMessageId, (message) => {
          message.error = error
        })
        setChatState((draft) => {
          draft.abortController = undefined
          draft.generatingMessageId = ''
        })
      }

      setChatState((draft) => {
        draft.abortController = undefined
        draft.generatingMessageId = ''
      })
    },
    [botId, chatState.bot, setChatState, updateMessage],
  )

  const resetConversation = useCallback(() => {
    chatState.bot.resetConversation()
    setChatState((draft) => {
      draft.abortController = undefined
      draft.generatingMessageId = ''
      draft.messages = []
      draft.conversationId = uuid()
    })
  }, [chatState.bot, setChatState])

  const stopGenerating = useCallback(() => {
    chatState.abortController?.abort()
    if (chatState.generatingMessageId) {
      updateMessage(chatState.generatingMessageId, (message) => {
        if (!message.text && !message.error) {
          message.text = 'Cancelled'
        }
      })
    }
    setChatState((draft) => {
      draft.generatingMessageId = ''
    })
  }, [chatState.abortController, chatState.generatingMessageId, setChatState, updateMessage])

  useEffect(() => {
    if (chatState.messages.length) {
      setConversationMessages(botId, chatState.conversationId, chatState.messages)
    }
  }, [botId, chatState.conversationId, chatState.messages])

  const chat = useMemo(
    () => ({
      botId,
      bot: chatState.bot,
      messages: chatState.messages,
      sendMessage,
      resetConversation,
      generating: !!chatState.generatingMessageId,
      stopGenerating,
    }),
    [
      botId,
      chatState.bot,
      chatState.generatingMessageId,
      chatState.messages,
      resetConversation,
      sendMessage,
      stopGenerating,
    ],
  )

  return chat
}
