import type { TranscriptItem } from '../type'

import { getChunckedTranscripts, getSummaryPrompt } from './prompt'

export function copyTranscriptAndPrompt(data: TranscriptItem[], documentTitle: string): string {
  const textData = data.map((item, index) => ({ ...item, index, text: `[${item.start}]${item.text}` }))
  const text = getChunckedTranscripts(textData, textData)
  const prompt = getSummaryPrompt(text, documentTitle)
  return prompt
}
