import type { TranscriptItem } from '../type'
import { getRawTranscript } from './transcript'

export function convertIntToHms(num: number): string {
  const h = num < 3600 ? 14 : 12
  return new Date(num * 1000).toISOString().substring(h, 19).toString()
}
export function waitForElm(selector: string): Promise<Element | null> {
  return new Promise((resolve) => {
    const element = document.querySelector(selector)
    if (element) {
      return resolve(element)
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector)
      if (element) {
        resolve(element)
        observer.disconnect()
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  })
}
export function getTYCurrentTime(): number {
  const videoEl: HTMLVideoElement = document.querySelector('#movie_player > div.html5-video-container > video')
  return videoEl ? videoEl.currentTime : 0
}
export function pauseVideoToggle() {
  const videoEl: HTMLVideoElement = document.querySelector('#movie_player > div.html5-video-container > video')
  if (!videoEl) {
    return
  }
  if (videoEl.paused) {
    videoEl.play()
  } else {
    videoEl.pause()
  }
}

export function getTYEndTime(): number {
  const videoEl: HTMLVideoElement = document.querySelector('#movie_player > div.html5-video-container > video')
  return videoEl ? videoEl.duration : 0
}

export async function getTranscriptHTML(link: string): Promise<TranscriptItem[]> {
  const rawTranscript = await getRawTranscript(link)

  const scriptObjArr = []
  const timeUpperLimit = 60
  const charInitLimit = 300
  const charUpperLimit = 500
  let loop = 0
  let chars: string[] = []
  let charCount = 0
  let timeSum = 0
  let tempObj: any = {}
  let remaining: any = {}
  function resetNums() {
    loop = 0
    chars = []
    charCount = 0
    timeSum = 0
    tempObj = {}
  }
  Array.from(rawTranscript).forEach((obj, i, arr) => {
    // Check Remaining Text from Prev Loop
    if (remaining.start && remaining.text) {
      tempObj.start = remaining.start
      chars.push(remaining.text)
      remaining = {} // Once used, reset to {}
    }

    // Initial Loop: Set Start Time
    if (loop == 0) {
      tempObj.start = remaining.start ? remaining.start : obj.start
    }

    loop++

    const startSeconds = Math.round(Number(tempObj.start))
    const seconds = Math.round(Number(obj.start))
    timeSum = seconds - startSeconds
    charCount += obj.text.length
    chars.push(obj.text)

    if (i == arr.length - 1) {
      tempObj.text = chars.join(' ').replace(/\n/g, ' ')
      scriptObjArr.push(tempObj)
      resetNums()
      return
    }

    if (timeSum > timeUpperLimit) {
      tempObj.text = chars.join(' ').replace(/\n/g, ' ')
      scriptObjArr.push(tempObj)
      resetNums()
      return
    }

    if (charCount > charInitLimit) {
      if (charCount < charUpperLimit) {
        if (obj.text.includes('.')) {
          const splitStr = obj.text.split('.')

          // Case: the last letter is . => Process regulary
          if (splitStr[splitStr.length - 1].replace(/\s+/g, '') == '') {
            tempObj.text = chars.join(' ').replace(/\n/g, ' ')
            scriptObjArr.push(tempObj)
            resetNums()
            return
          }

          // Case: . is in the middle
          // 1. Get the (length - 2) str, then get indexOf + str.length + 1, then substring(0,x)
          // 2. Create remaining { text: str.substring(x), start: obj.start } => use the next loop
          const lastText = splitStr[splitStr.length - 2]
          const substrIndex = obj.text.indexOf(lastText) + lastText.length + 1
          const textToUse = obj.text.substring(0, substrIndex)
          remaining.text = obj.text.substring(substrIndex)
          remaining.start = obj.start

          // Replcae arr element
          chars.splice(chars.length - 1, 1, textToUse)
          tempObj.text = chars.join(' ').replace(/\n/g, ' ')
          scriptObjArr.push(tempObj)
          resetNums()
          return
        } else {
          // Move onto next loop to find .
          return
        }
      }

      tempObj.text = chars.join(' ').replace(/\n/g, ' ')
      scriptObjArr.push(tempObj)
      resetNums()
      return
    }
  })

  return Array.from(scriptObjArr)
}
