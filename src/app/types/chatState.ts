import { BotId } from '~app/bots'
import { ErrorCode } from '~utils/errors'
import { ConversationContext } from './ConversationContext'
export type LastMessageType =
  | (ChatMessageModel & {
      time: string
    })
  | null

export type ChatState = {
  conversationContext?: ConversationContext
  botId: BotId
  messages: ChatMessageModel[]
  agentId: string | null
  generatingMessageId: string
  isSetup: boolean
  conversationId: string
}

export type ChatMessageState = {
  botId: BotId
  agentId: string | null

  lastMessage: LastMessageType | null
}
export interface ChatMessageModel {
  id: string
  author: BotId | 'user'
  text: string
  image?: Blob
  error?: ErrorCode
}
