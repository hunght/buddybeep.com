import i18next from 'i18next'
import { ofetch } from 'ofetch'
import Browser from 'webextension-polyfill'
import { BotId } from '~app/bots'
import logger from '~utils/logger'

export interface Prompt {
  agentId: string
  botId: BotId
  name: string
  prompt: string
}

export async function loadLocalPrompts() {
  const { prompts: value } = await Browser.storage.local.get('prompts')
  return (value || []) as Prompt[]
}

export async function saveLocalPrompt(prompt: Prompt) {
  const prompts = await loadLocalPrompts()
  let existed = false
  for (const p of prompts) {
    if (p.agentId === prompt.agentId) {
      p.name = prompt.name
      p.prompt = prompt.prompt
      existed = true
      break
    }
  }
  if (!existed) {
    prompts.unshift(prompt)
  }
  await Browser.storage.local.set({ prompts })
  return existed
}

export async function removeLocalPrompt(id: string) {
  const prompts = await loadLocalPrompts()
  await Browser.storage.local.set({ prompts: prompts.filter((p) => p.agentId !== id) })
}

export async function loadRemotePrompts() {
  return ofetch<Prompt[]>('https://buddybeep.com/api/community-prompts', {
    params: { language: i18next.language, languages: i18next.languages },
  }).catch((err) => {
    logger.error('[loadRemotePrompts] Failed to load remote prompts', err)
    return []
  })
}
