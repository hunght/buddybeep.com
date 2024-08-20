import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { BotId } from '~app/bots'
import { SidePanelMessageType } from '~app/types/sidePanel'

export const sidePanelBotAtom = atomWithStorage<BotId>('sidePanelBot', 'bing')

export const sidePanelSummaryAtom = atom<SidePanelMessageType | null>(null)
