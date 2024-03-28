import type { TranscriptItem } from '../type'
export const LAST_ITEM_TO_JUMP = 6
export function findCurrentItem(transcriptHTML: TranscriptItem[], currTime: number, lastItemIndex?: number) {
  const currentIndex = transcriptHTML.findIndex((obj) => {
    const objTime = Number(obj.start)
    return objTime >= currTime
  })
  const currentItem = transcriptHTML[currentIndex]
  if (!currentItem) {
    return { currentItem: null, nextItem: null }
  }

  if (currentIndex >= transcriptHTML.length - 1) {
    return { currentItem, nextItem: null }
  }
  const _lastItemIndex = lastItemIndex ?? LAST_ITEM_TO_JUMP
  const nextItem = transcriptHTML[currentIndex + 1]
  if (currentIndex + _lastItemIndex < transcriptHTML.length) {
    return { currentItem, nextItem, lastItem: transcriptHTML[currentIndex + _lastItemIndex] }
  }
  return { currentItem, nextItem }
}
