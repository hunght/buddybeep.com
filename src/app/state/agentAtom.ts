import chandler_bing from '~/assets/avatar/chandler_bing.png'
import business_conference from '~/assets/avatar/business_conference.png'
import seo from '~/assets/avatar/seo.png'
import jsonData from '~/assets/prompts.json'
type AgentType = {
  agentId: string
  name: string
  prompt: string
  category: string
  subcategory: string | null
  avatar: string | null
}

export const getAgent = ({ agentId }: { agentId: string; botId: string }): AgentType => {
  const agent = agents[agentId]

  return agent
}

export const agents: Record<string, AgentType> = jsonData as unknown as Record<string, AgentType>
