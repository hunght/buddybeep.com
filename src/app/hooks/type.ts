import { BotId } from '~app/bots'
import { ErrorCode } from '~utils/errors'
export type ChatState = {
  botId: BotId
  conversationContext: {
    contextIds: [string, string, string]
    requestParams: {
      atValue: string
      blValue?: string
    }
  }
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
