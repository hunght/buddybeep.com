import jsonData from '~/assets/prompts.json'
import vnJsonData from '~/assets/prompts.vn.json'
import thJsonData from '~/assets/prompts.th.json'
import inJsonData from '~/assets/prompts.in.json'
import jaJsonData from '~/assets/prompts.jp.json'
import zhJsonData from '~/assets/prompts.zh.json'
import zhtwJsonData from '~/assets/prompts.zh-tw.json'
import ptJsonData from '~/assets/prompts.pt.json'
import esJsonData from '~/assets/prompts.es.json'
import deJsonData from '~/assets/prompts.de.json'
import frJsonData from '~/assets/prompts.fr.json'

import { atom } from 'jotai'
import { agentsCategorization } from './data/categoriesData'

import { languageAtom } from './langAtom'
import { omit } from 'lodash-es'

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

export const getAllAgentsAtom = atom<Record<string, AgentType>>((get) => {
  const allAgents = jsonData as unknown as Record<string, AgentType>
  const lang = get(languageAtom)

  if (lang === 'en') {
    return allAgents
  }
  let object: Record<string, string> = {}

  switch (lang) {
    case 'vi':
      object = vnJsonData as unknown as Record<string, string>
      break
    case 'zh-CN':
      object = zhJsonData as unknown as Record<string, string>
      break
    case 'zh-TW':
      object = zhtwJsonData as unknown as Record<string, string>
      break
    case 'pt':
      object = ptJsonData as unknown as Record<string, string>
      break
    case 'es':
      object = esJsonData as unknown as Record<string, string>
      break
    case 'de':
      object = deJsonData as unknown as Record<string, string>
      break
    case 'fr':
      object = frJsonData as unknown as Record<string, string>
      break
    case 'ja':
      object = jaJsonData as unknown as Record<string, string>
      break
    case 'th':
      object = thJsonData as unknown as Record<string, string>
      break

    case 'in':
      object = inJsonData as unknown as Record<string, string>
      break
    default:
      return allAgents
  }

  const result: Record<string, AgentType> = {}

  // foreach key value of object

  Object.entries(allAgents).forEach(([key, value]) => {
    result[key] = {
      ...value,
      name: object[key] ?? value.name,
    }
  })

  return result
})

export const agentsByCategoryAtom = atom<AgentType[]>((get) => {
  const cat = get(categoryAtom)

  const searchQuery = get(searchQueryAtom)
  const allAgents = get(getAllAgentsAtom)
  const category = cat.category
  const subcategory = cat.subcategory
  let results: AgentType[] = []
  if (category === null) {
    const idsToRemove = ['explain-a-concept', 'writing-assistant', 'summary-web-content', 'summary-youtube-videos']

    results = Object.values(omit(allAgents, idsToRemove))
  } else if (subcategory === null) {
    const filteredAgents = agentsCategorization.filter((agent) => agent.category === category)

    results = filteredAgents.map((agent) => allAgents[agent.agentId])
  } else {
    const filteredAgents = agentsCategorization.filter(
      (agent) => agent.category === category && agent.subCategory === subcategory,
    )

    results = filteredAgents.map((agent) => allAgents[agent.agentId])
  }
  if (searchQuery.length > 0) {
    results = results.filter(
      (agent) =>
        agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.prompt?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }
  return results
})
