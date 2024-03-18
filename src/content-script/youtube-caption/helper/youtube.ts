import type { TranscriptItem } from "../type"
import { copyTextToClipboard } from "./copy"
import { getElementById } from "./htmlSelector"
import { getChunckedTranscripts, getSummaryPrompt } from "./prompt"

function noTranscriptionAlert(): void {
  const summaryText = document.querySelector("#yt_ai_summary_text")
  if (summaryText) {
    summaryText.innerHTML = `
            <div style="margin: 40px auto;text-align: center;">
                <p>No Transcription Available... 😢</p>
                <p>Try <a href="https://huggingface.co/spaces/jeffistyping/Youtube-Whisperer" target="_blank">Huggingface Youtube Whisperer</a> to transcribe!</p>
            </div>
        `
  }
}

function copyTranscript(videoId: string): void {
  let contentBody = ""
  const url = `https://www.youtube.com/watch?v=${videoId}`
  contentBody += `${document.title}\n`
  contentBody += `${url}\n\n`
  contentBody += `Transcript:\n`
  Array.from(getElementById("yt_ai_summary_text")?.children || []).forEach(
    (el) => {
      if (!el || el.children.length < 2) {
        return
      }

      const timestamp = //@ts-ignore
        el.querySelector(".yt_ai_summary_transcript_text_timestamp") //@ts-ignore
          ?.innerText || ""

      const text = //@ts-ignore
        el.querySelector(".yt_ai_summary_transcript_text")?.innerText || ""
      contentBody += `(${timestamp}) ${text}\n`
    }
  )

  copyTextToClipboard(contentBody)
}

interface TextData {
  text: string
  index: number
}

export function copyTranscriptAndPrompt(
  data: TranscriptItem[],
  documentTitle: string
): string {
  const textData = data.map((item, index) => ({ ...item, index }))
  const text = getChunckedTranscripts(textData, textData)
  const prompt = getSummaryPrompt(text, documentTitle)
  return prompt
}
