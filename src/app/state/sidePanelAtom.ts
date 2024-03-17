import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { BotId } from '~app/bots'

export const sidePanelBotAtom = atomWithStorage<BotId>('sidePanelBot', 'gemini')

export const sidePanelSummaryAtom = atom<string | null>(null)
