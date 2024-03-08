import { fetchRequestParams } from '~app/bots/gemini/api'

export interface ConversationContext {
  requestParams: Awaited<ReturnType<typeof fetchRequestParams>>
  contextIds: [string, string, string]
}
