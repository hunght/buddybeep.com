import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { BotId } from '~app/bots'

export const sidePanelBotAtom = atomWithStorage<BotId>('sidePanelBot', 'gemini')

export const sidePanelSummaryAtom = atom<{
  content: string | null
  link: string
  title: string
  type: 'summary-web-content' | 'summary-youtube-videos' | 'writing-assistant'
} | null>(null)
