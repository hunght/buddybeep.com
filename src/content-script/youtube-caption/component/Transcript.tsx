import React, { useEffect, useRef, useState } from 'react'

import { convertIntToHms, getTYCurrentTime, getTYEndTime } from '../helper/transcipt'
import type { TranscriptItem } from '../type'
import { classNames } from '../utils/classNames'
import { getElementById } from '../helper/htmlSelector'

type Props = {
  videoId: string
  transcriptHTML: TranscriptItem[]
}

export const Transcript: React.FC<Props> = ({ transcriptHTML, videoId }) => {
  const [transcriptItem, setTranscriptItem] = useState<TranscriptItem>()
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    let count = 0
    let yourFunctionTimeOutId: string | number
    const yourFunction = (transcriptItem: TranscriptItem) => {
      // Your function logic goes here
      const currTime = getTYCurrentTime()

      const firstItem = transcriptHTML.find((obj) => Number(obj.start) + Number(obj.duration) >= currTime)

      if (transcriptItem || transcriptItem?.start !== firstItem?.start) {
        let isSame = false
        setTranscriptItem((pre) => {
          if (pre?.start === firstItem?.start) {
            isSame = true
            return pre
          }
          return firstItem
        })
        if (!isSame && count % 10 === 0) {
          const element = getElementById(firstItem.start)
          if (element) {
            element.scrollIntoView({ behavior: 'auto', block: 'center' })
          }
        }
        count++
      }
      const delay = Number(firstItem.duration) * 1000
      // Call your function again after the delay
      yourFunctionTimeOutId = setTimeout(yourFunction, delay)
    }

    // Call your function initially
    yourFunction(transcriptItem)

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
            className={classNames(
              'flex justify-left items-baseline',
              transcriptItem?.start === obj.start && 'bg-gray-200',
            )}
          >
            <div className="text-2xl">{obj.text}</div>
          </li>
        )
      })}
    </ul>
  )
}
