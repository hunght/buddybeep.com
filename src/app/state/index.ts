import { atom } from 'jotai'
import { withImmer } from 'jotai-immer'
import { atomFamily, atomWithStorage } from 'jotai/utils'
import { BotId, createBotInstance } from '~app/bots'
import { BaichuanWebBot } from '~app/bots/baichuan'
import { BingWebBot } from '~app/bots/bing'
import { ChatGPTBot } from '~app/bots/chatgpt'
import { ClaudeBot } from '~app/bots/claude'
import { GeminiBot } from '~app/bots/gemini'
import { GeminiProBot } from '~app/bots/gemini-api'
import { GrokWebBot } from '~app/bots/grok'
import { LMSYSBot } from '~app/bots/lmsys'
import { PerplexityBot } from '~app/bots/perplexity'
import { PiBot } from '~app/bots/pi'
import { QianwenWebBot } from '~app/bots/qianwen'
import { XunfeiBot } from '~app/bots/xunfei'
import { FeatureId } from '~app/components/Premium/FeatureList'
import { CHAT_STATE_STORAGE } from '~app/consts'
import { ChatState } from '~app/hooks/type'

import { getDefaultThemeColor } from '~app/utils/color-scheme'
import { getNestedLocalStorage, setNestedLocalStorage } from '~app/utils/localStorage'
import { getBotSlug } from '~app/utils/slug'
import { Campaign } from '~services/server-api'
import { ChatMessageModel } from '~types'
import { uuid } from '~utils'

type Param = { botId: BotId; agentId: string | null }
type OriginalChatState = {
  botId: BotId
  bot:
    | ChatGPTBot
    | BingWebBot
    | GeminiBot
    | ClaudeBot
    | XunfeiBot
    | LMSYSBot
    | PiBot
    | GeminiProBot
    | QianwenWebBot
    | BaichuanWebBot
    | PerplexityBot
    | GrokWebBot
  agentId: string | null
  messages: ChatMessageModel[]
  generatingMessageId: string
  abortController: AbortController | undefined
  conversationId: string
  isSetup: boolean
}

const atomWithLocalStorage = (key: string, initialValue: OriginalChatState) => {
  const getInitialValue = (): OriginalChatState => {
    const serializeChatState = getNestedLocalStorage<ChatState>({ mainKey: CHAT_STATE_STORAGE, subKey: key })

    if (serializeChatState) {
      console.log(`==== serializeChatState ===`)
      console.log(serializeChatState)
      console.log('==== end log ===')

      initialValue.botId = serializeChatState.botId
      initialValue.messages = serializeChatState.messages.map((m) => ({
        id: m.id,
        text: m.text,
        image: m.image,
        author: m.author,
      }))

      initialValue.bot.setcontextIds = serializeChatState.conversationContext
      initialValue.isSetup = serializeChatState.isSetup
      initialValue.generatingMessageId = serializeChatState.generatingMessageId
      initialValue.conversationId = serializeChatState.conversationId
      initialValue.agentId = serializeChatState.agentId
    }
    return initialValue
  }
  const baseAtom = atom<OriginalChatState>(getInitialValue())
  const derivedAtom = atom(
    (get) => get(baseAtom),
    (get, set, update) => {
      const nextValue: OriginalChatState = typeof update === 'function' ? update(get(baseAtom)) : update
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
        conversationContext: nextValue.bot.contextIds,
        agentId: nextValue.agentId,
      }
      console.log(`==== nextValue ===`)
      console.log(nextValue)
      console.log('==== end log ===')
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
  (a, b) => a.botId === b.botId,
)

export const licenseKeyAtom = atomWithStorage('licenseKey', '', undefined, { getOnInit: true })
export const sidebarCollapsedAtom = atomWithStorage('sidebarCollapsed', false, undefined, { getOnInit: true })
export const themeColorAtom = atomWithStorage('themeColor', getDefaultThemeColor())
export const followArcThemeAtom = atomWithStorage('followArcTheme', false)
export const sidePanelBotAtom = atomWithStorage<BotId>('sidePanelBot', 'chatgpt')
export const showDiscountModalAtom = atom<false | true | Campaign>(false)
export const showPremiumModalAtom = atom<false | true | FeatureId>(false)
export const releaseNotesAtom = atom<string[]>([])
