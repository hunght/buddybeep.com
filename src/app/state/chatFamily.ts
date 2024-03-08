import { withImmer } from 'jotai-immer'
import { atomFamily } from 'jotai/utils'
import { createBotInstance } from '~app/bots'
import { getBotSlug } from '~app/utils/slug'
import { ChatMessageModel } from '~types'
import { uuid } from '~utils'
import { SetStateAction, atom } from 'jotai'

import { BotId } from '~app/bots'

import { CHAT_STATE_STORAGE } from '~app/consts'
import { OriginalChatState } from '~app/types/OriginalChatState'
import { ChatState } from '~app/types/chatState'

import { getNestedLocalStorage, setNestedLocalStorage } from '~app/utils/localStorage'

type Param = { botId: BotId; agentId: string | null }

const atomWithLocalStorage = (key: string, initialValue: OriginalChatState) => {
  const getInitialValue = (): OriginalChatState => {
    const serializeChatState = getNestedLocalStorage<ChatState>({ mainKey: CHAT_STATE_STORAGE, subKey: key })

    if (serializeChatState) {
      initialValue.botId = serializeChatState.botId
      initialValue.messages = serializeChatState.messages.map((m) => ({
        id: m.id,
        text: m.text,
        image: m.image,
        author: m.author,
      }))

      initialValue.bot.setConversationContext = serializeChatState.conversationContext
      initialValue.isSetup = serializeChatState.isSetup
      initialValue.generatingMessageId = serializeChatState.generatingMessageId
      initialValue.conversationId = serializeChatState.conversationId
      initialValue.agentId = serializeChatState.agentId
    }
    return initialValue
  }
  const baseAtom = atom<OriginalChatState>(getInitialValue())
  const derivedAtom = atom<OriginalChatState, [SetStateAction<OriginalChatState>], void>(
    (get) => get(baseAtom),
    (get, set, update) => {
      const nextValue = typeof update === 'function' ? update(get(baseAtom)) : update
      set(baseAtom, nextValue)

      const messages = nextValue.messages.map((m) => ({
        id: m.id,
        text: m.text,
        image: m.image,
        error: m.error?.code,
        author: m.author,
      }))

      const serializeChatState: ChatState = {
        botId: nextValue.botId,
        messages: messages,
        isSetup: nextValue.isSetup,
        generatingMessageId: nextValue.generatingMessageId,
        conversationId: nextValue.conversationId,
        conversationContext: nextValue.bot.getConversationContext,
        agentId: nextValue.agentId,
      }

      setNestedLocalStorage({ mainKey: CHAT_STATE_STORAGE, subKey: key, value: serializeChatState })
    },
  )
  return derivedAtom
}

export const chatFamily = atomFamily(
  (param: Param) => {
    const botSlug = getBotSlug({ botId: param.botId, agentId: param.agentId })
    const initialValue = {
      botId: param.botId,
      bot: createBotInstance(param.botId),
      messages: [] as ChatMessageModel[],
      generatingMessageId: '',
      abortController: undefined as AbortController | undefined,
      conversationId: uuid(),
      agentId: param.agentId ?? null,
      isSetup: false,
    }
    return withImmer(atomWithLocalStorage(botSlug, initialValue))
  },
  (a, b) => a.botId === b.botId && a.agentId === b.agentId,
)
