import { BotId } from '~app/bots'
import { ErrorCode } from '~utils/errors'
import { ConversationContext } from './ConversationContext'
export type ChatState = {
  botId: BotId
  agentId: string | null
  conversationContext?: ConversationContext
  messages: ChatMessageModel[]
  generatingMessageId: string
  isSetup: boolean
  conversationId: string
}
export interface ChatMessageModel {
  id: string
  author: BotId | 'user'
  text: string
  image?: Blob
  error?: ErrorCode
}
