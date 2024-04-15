import React, { useEffect, useRef, useState } from 'react'

import { convertIntToHms, getTYCurrentTime, getTYEndTime } from '../helper/transcipt'
import type { TranscriptItem } from '../type'

import { getElementById } from '../helper/htmlSelector'
import { cx } from '~utils'
import { LAST_ITEM_TO_JUMP, findCurrentItem } from './findCurrentItem'

type Props = {
  videoId: string
  transcriptHTML: TranscriptItem[]
}

export const Transcript: React.FC<Props> = ({ transcriptHTML, videoId }) => {
  const [transcriptItem, setTranscriptItem] = useState<TranscriptItem>()
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    let count = 0
    let yourFunctionTimeOutId: number
    const jumpingToCurrentTranscriptItem = (_transcriptItem?: TranscriptItem) => {
      // Your function logic goes here
      const currTime = getTYCurrentTime()

      const { currentItem: currentTranscriptItem, nextItem, lastItem } = findCurrentItem(transcriptHTML, currTime)
      if (!currentTranscriptItem) {
        yourFunctionTimeOutId = setTimeout(jumpingToCurrentTranscriptItem, 1000)
        return
      }
      if (_transcriptItem || _transcriptItem?.start !== currentTranscriptItem?.start) {
        let isSame = false
        setTranscriptItem((pre) => {
          if (pre?.start === currentTranscriptItem?.start) {
            isSame = true
            return pre
          }
          return currentTranscriptItem
        })
        // if (!isSame && count % LAST_ITEM_TO_JUMP === 0) {
        //   const element = getElementById(lastItem ? lastItem.start : currentTranscriptItem.start)
        //   if (element) {
        //     element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
        //   }
        // }
        count++
      }
      if (nextItem) {
        const delay = (Number(nextItem.start) - Number(currentTranscriptItem.start)) * 1000

        // Call your function again after the delay
        yourFunctionTimeOutId = setTimeout(jumpingToCurrentTranscriptItem, delay)
      }
    }

    jumpingToCurrentTranscriptItem(transcriptItem)

    return () => {
      clearTimeout(yourFunctionTimeOutId)
    }
  }, [transcriptHTML])

  return (
    <ul ref={listRef} className="p-4">
      {transcriptHTML.map((obj, index) => {
        return (
          <li
            key={obj.start ?? index}
            id={obj.start}
            data-start-time={obj.start}
            className={cx(
              'flex justify-left items-baselinerounded px-1 py-1',
              transcriptItem?.start === obj.start ? 'bg-gray-200' : '',
            )}
          >
            <div className="text-2xl">
              <span className="font-thin text-lg">{convertToTime(obj.start)}</span>
              {': '}
              {obj.text}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
function convertToTime(start: string): string {
  return convertIntToHms(Number(start))
}
