import jsonData from '~/assets/prompts.json'
import vnJsonData from '~/assets/prompts.vn.json'
import { atom } from 'jotai'
import { agentsCategorization } from './data/categoriesData'
import i18n from '~app/i18n'

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

export const getAllAgents = (): Record<string, AgentType> => {
  const allAgents = jsonData as unknown as Record<string, AgentType>
  const lang = i18n.language
  console.log(`==== lang ===`)
  console.log(lang)
  console.log('==== end log ===')

  if (lang === 'en') {
    return allAgents
  }
  let array: { agentId: string; name: string }[] = []

  switch (lang) {
    case 'vi':
      array = vnJsonData as unknown as { agentId: string; name: string }[]
      break
  }
  console.log(`==== array ===`)
  console.log(array)
  console.log('==== end log ===')

  const result: Record<string, AgentType> = {}
  array.forEach((agent) => {
    result[agent.agentId] = {
      ...allAgents[agent.agentId],
      name: agent.name,
    }
  })
  console.log(`==== result ===`)
  console.log(result)
  console.log('==== end log ===')

  return result
}

export const agentsByCategoryAtom = atom<AgentType[]>((get) => {
  const cat = get(categoryAtom)

  const searchQuery = get(searchQueryAtom)

  const category = cat.category
  const subcategory = cat.subcategory
  let results: AgentType[] = []
  if (category === null) {
    results = Object.values(getAllAgents())
  } else if (subcategory === null) {
    const filteredAgents = agentsCategorization.filter((agent) => agent.category === category)

    results = filteredAgents.map((agent) => getAllAgents()[agent.agentId])
  } else {
    const filteredAgents = agentsCategorization.filter(
      (agent) => agent.category === category && agent.subCategory === subcategory,
    )

    results = filteredAgents.map((agent) => getAllAgents()[agent.agentId])
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
