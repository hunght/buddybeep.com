import React, { useEffect, useRef, useState, useCallback } from 'react'

import { convertIntToHms, getTYCurrentTime } from '../helper/transcipt'
import type { TranscriptItem } from '../type'

import { cx } from '~utils'
import { findCurrentItem } from './findCurrentItem'

type Props = {
  videoId: string
  transcriptHTML: TranscriptItem[]
}

export const Transcript: React.FC<Props> = ({ transcriptHTML, videoId }) => {
  const [transcriptItem, setTranscriptItem] = useState<TranscriptItem>()
  const listRef = useRef<HTMLUListElement>(null)

  const jumpingToCurrentTranscriptItem = useCallback(
    (_transcriptItem?: TranscriptItem) => {
      const currTime = getTYCurrentTime()
      const { currentItem: currentTranscriptItem, nextItem } = findCurrentItem(transcriptHTML, currTime)

      if (!currentTranscriptItem) {
        return false
      }

      setTranscriptItem((pre) => (pre?.start === currentTranscriptItem?.start ? pre : currentTranscriptItem))

      return nextItem ? (Number(nextItem.start) - Number(currentTranscriptItem.start)) * 1000 : null
    },
    [transcriptHTML],
  )

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const runJumpingLogic = () => {
      const delay = jumpingToCurrentTranscriptItem(transcriptItem)
      if (delay !== false) {
        timeoutId = setTimeout(runJumpingLogic, delay || 1000)
      }
    }

    runJumpingLogic()

    return () => clearTimeout(timeoutId)
  }, [jumpingToCurrentTranscriptItem, transcriptItem])

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
