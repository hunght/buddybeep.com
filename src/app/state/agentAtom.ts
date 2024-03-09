import chandler_bing from '~/assets/avatar/chandler_bing.png'
import business_conference from '~/assets/avatar/business_conference.png'
import seo from '~/assets/avatar/seo.png'
import jsonData from '~/assets/prompts.json'
import { atom } from 'jotai'
import { agentsCategorization } from './data/categoriesData'
type AgentType = {
  agentId: string
  name: string
  prompt: string

  avatar: string | null
}

export const categoryAtom = atom<{ category: string | null; subcategory: string | null }>({
  category: null,
  subcategory: null,
})
export const searchQueryAtom = atom<string>('')
export const allAgents: Record<string, AgentType> = jsonData as unknown as Record<string, AgentType>

export const agentsByCategoryAtom = atom<AgentType[]>((get) => {
  const cat = get(categoryAtom)
  console.log(`==== cat ===`)
  console.log(cat)
  console.log('==== end log ===')
  const searchQuery = get(searchQueryAtom)
  console.log(`==== searchQuery ===`)
  console.log(searchQuery)
  console.log('==== end log ===')

  const category = cat.category
  const subcategory = cat.subcategory
  let results: AgentType[] = []
  if (category === null) {
    results = Object.values(allAgents)
  } else if (subcategory === null) {
    const filteredAgents = agentsCategorization.filter((agent) => agent.category === category)
    console.log(`==== filteredAgents ===`)
    console.log(filteredAgents)
    console.log('==== end log ===')

    results = filteredAgents.map((agent) => allAgents[agent.agentId])
  } else {
    const filteredAgents = agentsCategorization.filter(
      (agent) => agent.category === category && agent.subCategory === subcategory,
    )
    console.log(`==== filteredAgents ===`)
    console.log(filteredAgents)
    console.log('==== end log ===')
    results = filteredAgents.map((agent) => allAgents[agent.agentId])
  }
  if (searchQuery.length > 0) {
    results = results.filter(
      (agent) =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.prompt.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }
  return results
})
