import {
  ArrowDownOnSquareStackIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
  PlayPauseIcon,
} from '@heroicons/react/24/outline'
import { Collapsible, CollapsibleContent } from '@radix-ui/react-collapsible'
import React, { useEffect, useState } from 'react'

import { Tooltip } from './component/Tooltip'
import { Transcript } from './component/Transcript'

import { getElementById } from './helper/htmlSelector'

import { getTYCurrentTime, pauseVideoToggle } from './helper/transcipt'
import { getLangOptionsWithLink, getRawTranscript } from './helper/transcript'
import { copyTranscriptAndPrompt } from './helper/youtube'
import type { LangOption, TranscriptItem } from './type'

import { useTranslation } from 'react-i18next'
import { useAtomValue } from 'jotai'
import { youtubeVideoDataAtom } from '~app/state/youtubeAtom'
import logger from '~utils/logger'

export const ContentScript: React.FC = () => {
  const youtubeVideoData = useAtomValue(youtubeVideoDataAtom)
  const videoId = youtubeVideoData?.url
  logger.log('videoId', videoId)
  const [transcriptHTML, setTranscriptHTML] = useState<TranscriptItem[]>([])

  const [open, setOpen] = React.useState(true)
  const [langOptions, setLangOptions] = useState<LangOption[]>([])
  const [currentLangOption, setCurrentLangOption] = useState<LangOption>()
  const { t } = useTranslation()

  // make useEffect to get langOptions  when videoId changes
  useEffect(() => {
    async function fetchTranscript() {
      try {
        if (!videoId) {
          return
        }
        setTranscriptHTML([])
        // Get Transcript Language Options & Create Language Select Btns
        const langOptionsWithLink = await getLangOptionsWithLink(videoId)
        if (!langOptionsWithLink) {
          logger.log('no langOptionsWithLink')
          return
        }
        setLangOptions(langOptionsWithLink)

        setCurrentLangOption(langOptionsWithLink[0])
      } catch (error) {
        logger.error('[fetchTranscript] Error fetching data:', error)
      }
    }

    fetchTranscript()
  }, [videoId])

  // make useEffect to get transcriptHTML when currentLangOption changes
  useEffect(() => {
    async function fetchTranscript() {
      try {
        if (!currentLangOption) {
          logger.log('no currentLangOption')
          return
        }

        // Create Transcript HTML & Add Event Listener
        const transcriptHTML = await getRawTranscript(currentLangOption.link)

        setTranscriptHTML(transcriptHTML)
      } catch (error) {
        logger.error('Error fetching data:', error)
      }
    }

    fetchTranscript()
  }, [currentLangOption])

  if (!videoId) {
    return <div></div>
  }
  const isHasTranscripts = transcriptHTML.length > 0 && !!videoId
  return (
    <div
      style={{
        zIndex: 2147483647,
        position: 'relative',
        backgroundColor: '#1b141d',
        width: '420px',
        height: isHasTranscripts && open ? '28rem' : '4rem',
        borderRadius: '1rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: '0px',
          left: '0px',
          borderRadius: '1rem',
          overflow: 'hidden',
          width: '420px',
        }}
      >
        <Collapsible
          className="w-full rounded z-10 bg-primary-background flex flex-col"
          open={isHasTranscripts && open}
          onOpenChange={setOpen}
        >
          <div className="flex items-center flex-1 text-white py-2 px-4 rounded w-full">
            <img
              src={chrome.runtime.getURL('src/assets/icon.png')}
              style={{ width: 25, height: 25, cursor: 'pointer' }}
              onClick={() => {
                chrome.runtime.sendMessage({
                  action: 'openMainApp',
                })
              }}
            />
            <div className="text-lg font-bold px-1 flex-1">{chrome.i18n.getMessage('Transcripts')} </div>
            <div className="flex justify-between items-center gap-2 px-4 py-1">
              <Tooltip text="Summary video with BuddyBeep">
                <button
                  className="px-4 items-center justify-center py-2 bg-indigo-500  hover:bg-blue-700 text-white font-bold rounded-xl"
                  onClick={() => {
                    const prompt = copyTranscriptAndPrompt(transcriptHTML, document.title)
                    chrome.runtime.sendMessage({
                      action: 'openSidePanel',
                      content: prompt,
                      link: window.location.href,
                      title: document.title,
                      type: 'summary-youtube-videos',
                    })
                  }}
                >
                  <div className="flex flex-row ">
                    {chrome.i18n.getMessage('Summary')} <DocumentTextIcon className="h-6 w-6" />
                  </div>
                </button>
              </Tooltip>

              {isHasTranscripts && (
                <Tooltip text="Jump to current time">
                  <button
                    className="px-4 items-center justify-center py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-xl"
                    onClick={() => {
                      if (!open) {
                        setOpen(true)
                      }
                      const currTime = getTYCurrentTime()

                      const firstItem = transcriptHTML.find(
                        (obj) => Number(obj.start) + Number(obj.duration) >= currTime,
                      )

                      const element = firstItem ? getElementById(firstItem.start) : null
                      if (element) {
                        element.scrollIntoView({ behavior: 'auto', block: 'center' })
                      }
                    }}
                  >
                    <ArrowDownOnSquareStackIcon className="h-6 w-6" />
                  </button>
                </Tooltip>
              )}
              <Tooltip text="Play or Pause Video">
                <button
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-xl"
                  onClick={() => {
                    pauseVideoToggle()
                  }}
                >
                  <PlayPauseIcon className="h-6 w-6" />
                </button>
              </Tooltip>
              {isHasTranscripts && (
                <Tooltip text="Collap or Expand View">
                  <button
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-xl dark:bg-gray-900"
                    onClick={() => {
                      setOpen(!open)
                    }}
                  >
                    {!open ? <ChevronDownIcon className="h-6 w-6" /> : <ChevronUpIcon className="h-6 w-6" />}
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
          {/* {langOptions.length > 3 && (
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
          )} */}

          <CollapsibleContent className="overflow-scroll h-96 bg-white text-primary-text rounded-lg">
            {transcriptHTML.length > 0 && videoId && <Transcript videoId={videoId} transcriptHTML={transcriptHTML} />}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
