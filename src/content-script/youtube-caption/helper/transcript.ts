import he from 'he'
import { DOMParser } from 'xmldom'

import type { LangOption, TranscriptItem } from '../type'

export async function getLangOptionsWithLink(videoId: string): Promise<LangOption[] | undefined> {
  const videoPageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`)
  const videoPageHtml = await videoPageResponse.text()
  const splittedHtml = videoPageHtml.split('"captions":')

  if (splittedHtml.length < 2) {
    return
  }

  const captions_json: any = JSON.parse(splittedHtml[1].split(',"videoDetails')[0].replace('\n', ''))
  const captionTracks = captions_json.playerCaptionsTracklistRenderer.captionTracks
  const languageOptions = Array.from(captionTracks).map((i: any) => i.name.simpleText)

  const first = 'English'
  languageOptions.sort((x, y) => (x.includes(first) ? -1 : y.includes(first) ? 1 : 0))
  languageOptions.sort((x, y) => (x === first ? -1 : y === first ? 1 : 0))

  return Array.from(languageOptions).map((langName, index) => {
    const link = captionTracks.find((i: any) => i.name.simpleText === langName).baseUrl
    return {
      language: langName,
      link: link,
    }
  })
}

export async function getTranscript(langOption: LangOption): Promise<string> {
  const rawTranscript = await getRawTranscript(langOption.link)
  const transcript = rawTranscript.map((item) => item.text).join(' ')
  return transcript
}

function parseNode(node) {
  const obj = {}

  if (node.attributes.length > 0) {
    for (let i = 0; i < node.attributes.length; i++) {
      const attribute = node.attributes[i]
      obj[attribute.name] = attribute.value
    }
  }

  if (node.childNodes.length > 0) {
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i]

      if (child.nodeType === 1) {
        if (obj[child.nodeName]) {
          if (!Array.isArray(obj[child.nodeName])) {
            obj[child.nodeName] = [obj[child.nodeName]]
          }
          obj[child.nodeName].push(parseNode(child))
        } else {
          obj[child.nodeName] = parseNode(child)
        }
      } else if (child.nodeType === 3 && child.nodeValue.trim()) {
        obj['text'] = child.nodeValue.trim()
      }
    }
  }

  return obj
}
function parseXML(xmlString): any {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
  const json = parseNode(xmlDoc.documentElement)
  return json
}

export async function getRawTranscript(link: string): Promise<TranscriptItem[]> {
  // Get Transcript
  const transcriptPageResponse = await fetch(link) // default 0
  const transcriptPageXml = await transcriptPageResponse.text()

  // Parse Transcript
  const jQueryParse = parseXML(transcriptPageXml)
  const textNodes = jQueryParse.text
  return textNodes.map((i: any) => {
    return {
      start: i.start,
      duration: i.dur,
      text: i.text ? he.decode(i.text) : '',
    }
  })
}
