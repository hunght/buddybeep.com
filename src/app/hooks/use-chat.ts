import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'
import { trackEvent } from '~app/plausible'
import { chatFamily } from '~app/state/chatFamily'
import { compressImageFile } from '~app/utils/image-compression'
import { setConversationMessages } from '~services/chat-history'
import { ChatMessageModel } from '~types'
import { uuid } from '~utils'
import { ChatError } from '~utils/errors'
import { BotId } from '../bots'
import { getAllAgentsAtom } from '~app/state/agentAtom'

import logger from '~utils/logger'
import { atomChatStateLocalStorage } from '~app/state/atomWithLocalStorage'
import { getBotSlug } from '~app/utils/slug'
import { LastMessageType } from '~app/types/chatState'
import { buildPromptWithLang } from '~app/utils/lang'

export function useChat(botId: BotId, agentId: string | null) {
  const chatAtom = useMemo(() => chatFamily({ botId, agentId }), [botId, agentId])
  const [, setChatStateLocalStorage] = useAtom(atomChatStateLocalStorage)

  const allAgents = useAtomValue(getAllAgentsAtom)
  const [chatState, setChatState] = useAtom(chatAtom)

  const updateMessage = useCallback(
    (messageId: string, updater: (message: ChatMessageModel) => void) => {
      setChatState((draft) => {
        const message = draft.messages.find((m) => m.id === messageId)
        if (message) {
          updater(message)
          setChatStateLocalStorage((prev) => {
            const botSlug = getBotSlug({ agentId, botId })
            const botChatState = prev[botSlug]

            const lastMessage: LastMessageType = {
              id: messageId,
              text: message?.text ?? '',
              time: Date.now().toString(),
              author: message?.author ?? 'user',
            }
            if (!botChatState) {
              return {
                ...prev,
                [botSlug]: {
                  botId,
                  agentId,
                  lastMessage: lastMessage,
                },
              }
            }
            return {
              ...prev,
              [botSlug]: {
                ...botChatState,
                lastMessage: lastMessage,
              },
            }
          })
        }
      })
    },
    [setChatState],
  )

  const sendMessage = useCallback(
    async (input: string, image?: File, summary?: { link: string; title: string }): Promise<string> => {
      trackEvent('send_message', { botId, withImage: !!image, name: chatState.bot.name })

      const botMessageId = uuid()
      setChatState((draft) => {
        draft.messages.push(
          { id: uuid(), text: summary ? `[${summary.title}](${summary.link})` : input, image, author: 'user' },
          { id: botMessageId, text: null, author: botId },
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
      let lastAnswer = ''
      try {
        for await (const answer of resp) {
          lastAnswer = answer.text
          updateMessage(botMessageId, (message) => {
            message.text = answer.text
          })
        }
      } catch (err: unknown) {
        if (!abortController.signal.aborted) {
          abortController.abort()
        }
        const error = err as ChatError
        logger.error('sendMessage error', error.code, error)
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
      return lastAnswer
    },
    [botId, chatState.bot, setChatState, updateMessage],
  )

  // send the prompt to the bot when the agent is set
  useEffect(() => {
    if (
      agentId === 'summary-web-content' ||
      agentId === 'summary-youtube-videos' ||
      agentId === 'writing-assistant' ||
      agentId === 'explain-a-concept'
    ) {
      // don't send prompt to summary-web-content agent
      return
    }
    const prompt = agentId ? allAgents[agentId]?.prompt : undefined
    if (prompt && !chatState.isSetup) {
      sendMessage(buildPromptWithLang(prompt))
      setChatState((draft) => {
        draft.isSetup = true
      })
    }
  }, [agentId, allAgents, chatState.isSetup, sendMessage, setChatState])

  const resetConversation = useCallback(() => {
    chatState.bot.resetConversation()
    setChatState((draft) => {
      draft.abortController = undefined
      draft.generatingMessageId = ''
      draft.messages = []
      draft.conversationId = uuid()
      draft.isSetup = false
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
      agentId,
    }),
    [
      botId,
      agentId,
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
