import { SidePanelMessageType } from '~app/types/sidePanel'

export function getLinkFromSummaryObject(summaryText: SidePanelMessageType): string {
  if (summaryText.noteId) {
    return `https://buddybeep.com/dashboard/${summaryText.noteId}`
  }
  return summaryText.link
}
