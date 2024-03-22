import { FormatWritingType } from '~app/types/writing'

export function createChatGPTPrompt({
  originalText,
  replyContent,
  tone,
  length,
  format,
  language,
}: {
  originalText: string
  replyContent: string
  tone: string
  length: string
  format: FormatWritingType
  language: string
}) {
  // Normalize the tone to match ChatGPT's expected keywords
  const toneMapping: Record<string, string> = {
    formal: 'in a formal tone',
    casual: 'in a casual tone',
    professional: 'professionally',
    enthusiastic: 'enthusiastically',
    informational: 'with informative content',
    funny: 'with a touch of humor',
  }

  // Normalize the length to match ChatGPT's expected keywords
  const lengthMapping: Record<string, string> = {
    short: 'concisely',
    medium: 'in moderate detail',
    long: 'in depth',
  }

  // Normalize the format to match ChatGPT's expected keywords
  const formatMapping: Record<string, string> = {
    comment: 'as a comment',
    email: 'as an email',
    message: 'as a direct message',
    twitter: 'as a tweet',
  }

  // Create the prompt based on the mappings and provided inputs
  const prompt = `Please write a reply in ${language} to the following text "${originalText}" with the general content "${replyContent}", ${toneMapping[tone]}, ${lengthMapping[length]}, ${formatMapping[format]}.`

  return prompt
}

// // Example usage:
// const originalText = "I'm looking for book recommendations in the fantasy genre."
// const replyContent = 'Sure, I can help with that. Are you looking for classic fantasy or something more modern?'
// const tone = 'Casual'
// const length = 'Medium'
// const format = 'Comment'
// const language = 'Spanish' // Example language

// const prompt = createChatGPTPrompt(originalText, replyContent, tone, length, format, language)
// console.log(prompt)
