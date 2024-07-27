import {
  ArrowDownOnSquareStackIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardDocumentListIcon,
  PauseIcon,
  PlayIcon,
  XMarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { Collapsible, CollapsibleContent } from '@radix-ui/react-collapsible'
import React, { useEffect, useRef, useState } from 'react'

import { Tooltip } from './component/Tooltip'
import { Transcript } from './component/Transcript'

import { getElementById } from './helper/htmlSelector'

import { getTYCurrentTime, pauseVideoToggle } from './helper/transcipt'
import { getLangOptionsWithLink, getRawTranscript } from './helper/transcript'
import { copyTranscriptAndPrompt } from './helper/youtube'
import type { LangOption, TranscriptItem } from './type'

import { useAtomValue } from 'jotai'
import { youtubeVideoDataAtom } from '~app/state/youtubeAtom'
import logger from '~utils/logger'
import { findCurrentItem } from './component/findCurrentItem'
import { useSuccessPopup } from '~hooks/useSuccessPopup'
import { useInterval } from '~/hooks/useInterval'

export const ContentScript: React.FC = () => {
  const youtubeVideoData = useAtomValue(youtubeVideoDataAtom)
  const videoId = youtubeVideoData?.url

  const [transcriptHTML, setTranscriptHTML] = useState<TranscriptItem[]>([])
  const [open, setOpen] = React.useState(false)
  const [currentLangOption, setCurrentLangOption] = useState<LangOption>()
  const [isWidgetVisible, setIsWidgetVisible] = useState(true)
  const { setShowSuccess } = useSuccessPopup()
  const [autoScroll, setAutoScroll] = useState(false)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    chrome.storage.sync.get(['transcriptWidgetVisible'], (result) => {
      setIsWidgetVisible(result.transcriptWidgetVisible !== false)
    })
  }, [])

  useEffect(() => {
    async function fetchTranscript() {
      try {
        if (!videoId) {
          return
        }
        setTranscriptHTML([])
        const langOptionsWithLink = await getLangOptionsWithLink(videoId)
        if (!langOptionsWithLink) {
          logger.log('no langOptionsWithLink')
          return
        }

        setCurrentLangOption(langOptionsWithLink[0])
      } catch (error) {
        logger.error('[fetchTranscript] Error fetching data:', error)
      }
    }

    fetchTranscript()
  }, [videoId])

  useEffect(() => {
    async function fetchTranscript() {
      try {
        if (!currentLangOption) {
          logger.log('no currentLangOption')
          return
        }

        const transcriptHTML = await getRawTranscript(currentLangOption.link)
        setTranscriptHTML(transcriptHTML)
      } catch (error) {
        logger.error('Error fetching data:', error)
      }
    }

    fetchTranscript()
  }, [currentLangOption])

  const handleCloseWidget = () => {
    setIsWidgetVisible(false)
    chrome.storage.sync.set({ transcriptWidgetVisible: false })
  }

  const isHasTranscripts = transcriptHTML.length > 0 && !!videoId

  const scrollToCurrentTime = () => {
    if (!transcriptRef.current || !isElementInViewport(transcriptRef.current)) {
      return
    }

    const currTime = getTYCurrentTime()
    const { lastItem, currentItem } = findCurrentItem(transcriptHTML, currTime, 3)
    const element = getElementById(lastItem ? lastItem.start : currentItem?.start)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'end' })
    }
  }

  const handleToggleCollapse = () => {
    const newOpenState = !open
    setOpen(newOpenState)
    setAutoScroll(newOpenState)
    if (newOpenState) {
      scrollToCurrentTime()
    }
  }

  useInterval(
    () => {
      if (open && autoScroll) {
        scrollToCurrentTime()
      }
    },
    open && autoScroll ? 1000 : null,
  )

  useEffect(() => {
    const checkPlayState = () => {
      const video = document.querySelector('video')
      setIsPlaying(!video?.paused)
    }

    checkPlayState()
    document.addEventListener('play', checkPlayState, true)
    document.addEventListener('pause', checkPlayState, true)

    return () => {
      document.removeEventListener('play', checkPlayState, true)
      document.removeEventListener('pause', checkPlayState, true)
    }
  }, [])

  if (!videoId || !isHasTranscripts || !isWidgetVisible) {
    return null
  }

  return (
    <div
      style={{
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
          <div className="flex items-center flex-1 text-white py-2 px-4 rounded w-full relative bg-gray-800">
            <div
              className="text-lg font-bold px-1 flex-1 cursor-pointer hover:text-blue-500 flex items-center gap-2"
              onClick={() => {
                chrome.runtime.sendMessage({
                  action: 'openMainApp',
                })
              }}
            >
              <img src="https://www.buddybeep.com/logo-300.png" alt="logo" width={24} height={24} />
              {chrome.i18n.getMessage('Transcripts')}
            </div>
            <div className="flex justify-between items-center gap-2 px-4 py-1">
              <ToolbarButton
                tooltip="Summary video with BuddyBeep"
                onClick={async () => {
                  const prompt = copyTranscriptAndPrompt(transcriptHTML, document.title)
                  const data = await chrome.runtime.sendMessage({
                    action: 'openSidePanel',
                    content: prompt,
                    link: window.location.href,
                    title: document.title,
                    type: 'summary-youtube-videos',
                  })
                  setShowSuccess(data?.noteId ?? '')
                }}
                icon={<ClipboardDocumentListIcon className="h-5 w-5" />}
                text={chrome.i18n.getMessage('Summary')}
              />
              {isHasTranscripts && (
                <ToolbarButton
                  tooltip={autoScroll ? 'Stop auto-scrolling' : 'Auto-scroll to current time'}
                  onClick={() => {
                    setAutoScroll(!autoScroll)
                    if (!open) {
                      setOpen(true)
                    }
                    if (!autoScroll) {
                      scrollToCurrentTime()
                    }
                  }}
                  icon={
                    autoScroll ? (
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    ) : (
                      <ArrowDownOnSquareStackIcon className="h-5 w-5" />
                    )
                  }
                  className={autoScroll ? 'bg-green-600 hover:bg-green-700' : ''}
                />
              )}
              <ToolbarButton
                tooltip={isPlaying ? 'Pause Video' : 'Play Video'}
                onClick={() => {
                  pauseVideoToggle()
                  setIsPlaying(!isPlaying)
                }}
                icon={isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
              />
              {isHasTranscripts && (
                <ToolbarButton
                  tooltip="Collapse or Expand View"
                  onClick={handleToggleCollapse}
                  icon={!open ? <ChevronDownIcon className="h-5 w-5" /> : <ChevronUpIcon className="h-5 w-5" />}
                />
              )}
            </div>
            <ToolbarButton
              tooltip="Close BuddyBeep. You can open later in setting page"
              onClick={handleCloseWidget}
              icon={<XMarkIcon className="h-5 w-5" />}
              className="ml-2"
            />
          </div>

          <CollapsibleContent
            className="overflow-scroll h-96 bg-white text-primary-text rounded-lg"
            ref={transcriptRef}
          >
            {transcriptHTML.length > 0 && videoId && <Transcript videoId={videoId} transcriptHTML={transcriptHTML} />}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}

const ToolbarButton: React.FC<{
  tooltip: string
  onClick: () => void
  icon: React.ReactNode
  text?: string
  className?: string
}> = ({ tooltip, onClick, icon, text, className }) => (
  <Tooltip text={tooltip}>
    <button
      className={`px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center ${className}`}
      onClick={onClick}
    >
      {text && <span className="mr-2">{text}</span>}
      {icon}
    </button>
  </Tooltip>
)

function isElementInViewport(el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}
