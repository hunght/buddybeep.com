import { BotId } from '~app/bots'

export type InsertPropmtType = ({ botId, agentId }: { botId: BotId; agentId: string | null }) => void
