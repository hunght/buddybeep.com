import {
  ArrowDownOnSquareStackIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardDocumentIcon,
  DocumentTextIcon,
  PlayPauseIcon,
} from '@heroicons/react/24/outline'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible'
import React, { useEffect, useRef, useState } from 'react'

import { Tooltip } from './component/Tooltip'
import { Transcript } from './component/Transcript'
import { copyTextToClipboard } from './helper/copy'
import { getElementById } from './helper/htmlSelector'
import { getSearchParam } from './helper/searchParam'
import { convertIntToHms, getTYCurrentTime, getTYEndTime, pauseVideoToggle } from './helper/transcipt'
import { getLangOptionsWithLink, getRawTranscript } from './helper/transcript'
import { copyTranscriptAndPrompt } from './helper/youtube'
import type { LangOption, TranscriptItem } from './type'

export const ContentScript: React.FC = () => {
  const videoId = getSearchParam(window.location.href).v
  const documentTitle = document.title
  const [transcriptHTML, setTranscriptHTML] = useState<TranscriptItem[]>([])
  const [tab, setTab] = useState<'transcipt' | 'summary'>('transcipt')
  const [open, setOpen] = React.useState(true)
  const [langOptions, setLangOptions] = useState<LangOption[]>([])
  const [currentLangOption, setCurrentLangOption] = useState<LangOption>()

  // make useEffect to get langOptions  when videoId changes
  useEffect(() => {
    async function fetchTranscript() {
      try {
        // Get Transcript Language Options & Create Language Select Btns
        const langOptionsWithLink = await getLangOptionsWithLink(videoId)
        if (!langOptionsWithLink) {
          console.log('no langOptionsWithLink')
          return
        }
        setLangOptions(langOptionsWithLink)

        setCurrentLangOption(langOptionsWithLink[0])
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchTranscript()
  }, [videoId])

  // make useEffect to get transcriptHTML when currentLangOption changes
  useEffect(() => {
    async function fetchTranscript() {
      try {
        if (!currentLangOption) {
          console.log('no currentLangOption')
          return
        }

        // Create Transcript HTML & Add Event Listener
        const transcriptHTML = await getRawTranscript(currentLangOption.link)

        setTranscriptHTML(transcriptHTML)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchTranscript()
  }, [currentLangOption])

  return (
    <div
      style={{
        zIndex: 2147483647,
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: '0px',
          left: '0px',
        }}
      >
        <Collapsible className="block w-full rounded z-10 bg-primary-blue" open={open} onOpenChange={setOpen}>
          <div className="flex justify-between items-center text-white py-2 px-4 rounded">
            Transcript & Learn new word
            <div className="flex justify-between items-center gap-2 px-4 py-1">
              <Tooltip text="Show full transcript of the video">
                <button
                  className="px-4 items-center justify-center py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
                  onClick={() => {
                    setTab('transcipt')
                    setOpen(true)
                  }}
                >
                  <DocumentTextIcon className="h-6 w-6" />
                </button>
              </Tooltip>

              <Tooltip text="Copy transcipt to clipboard and You can paste to ChatGPT to summary">
                <button
                  className="px-4 items-center justify-center py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
                  onClick={() => {
                    const prompt = copyTranscriptAndPrompt(transcriptHTML, documentTitle)
                    copyTextToClipboard(prompt)
                  }}
                >
                  <ClipboardDocumentIcon className="h-6 w-6" />
                </button>
              </Tooltip>
              <Tooltip text="Jump to current time">
                <button
                  className="px-4 items-center justify-center py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
                  onClick={() => {
                    if (!open) {
                      setOpen(true)
                    }
                    const currTime = getTYCurrentTime()

                    const firstItem = transcriptHTML.find((obj) => Number(obj.start) + Number(obj.duration) >= currTime)

                    const element = firstItem ? getElementById(firstItem.start) : null
                    if (element) {
                      element.scrollIntoView({ behavior: 'auto', block: 'center' })
                    }
                  }}
                >
                  <ArrowDownOnSquareStackIcon className="h-6 w-6" />
                </button>
              </Tooltip>
              <Tooltip text="Play or Pause Video">
                <button
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
                  onClick={() => {
                    pauseVideoToggle()
                  }}
                >
                  <PlayPauseIcon className="h-6 w-6" />
                </button>
              </Tooltip>
              <Tooltip text="Collap or Expand View">
                <button
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
                  onClick={() => {
                    setOpen(!open)
                  }}
                >
                  {!open ? <ChevronDownIcon className="h-6 w-6" /> : <ChevronUpIcon className="h-6 w-6" />}
                </button>
              </Tooltip>
            </div>
          </div>
          {langOptions.length > 3 && (
            <div className="flex px-4 pb-1 justify-between items-center gap-1">
              {langOptions.map((lang) => (
                <button
                  key={lang.language}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
                  onClick={() => {
                    setCurrentLangOption(lang)
                  }}
                >
                  {lang.language}
                </button>
              ))}
            </div>
          )}

          <CollapsibleContent className="bg-red-300 overflow-scroll h-96">
            {transcriptHTML.length > 0 && <Transcript videoId={videoId} transcriptHTML={transcriptHTML} />}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
