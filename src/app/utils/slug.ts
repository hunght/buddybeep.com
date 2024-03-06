export function getBotSlug({ agentId, botId }: { agentId: string | null; botId: string }) {
  return botId + (agentId ? `-${agentId}` : '')
}
