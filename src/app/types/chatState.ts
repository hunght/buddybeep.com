import { BotId } from '~app/bots'
import { ErrorCode } from '~utils/errors'
import { ConversationContext } from './ConversationContext'
export type LastMessageType =
  | (ChatMessageModel & {
      time: string
    })
  | null

export type ChatState = {
  botId: BotId
  agentId: string | null
  conversationContext?: ConversationContext
  messages: ChatMessageModel[]
  lastMessage: LastMessageType
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
