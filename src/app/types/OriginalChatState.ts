import { BotId } from '~app/bots'
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
import { ChatMessageModel } from '~types'

export type OriginalChatState = {
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
