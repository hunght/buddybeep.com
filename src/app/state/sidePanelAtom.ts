import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { BotId } from '~app/bots'

export const sidePanelBotAtom = atomWithStorage<BotId>('sidePanelBot', 'gemini')

export const sidePanelSummaryAtom = atom<{ content: string; link: string; title: string } | null>(null)
