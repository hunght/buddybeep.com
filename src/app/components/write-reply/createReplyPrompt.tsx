import { FormatWritingType } from '~app/types/writing'

export function createReplyPrompt({
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
    'linkedin-comment':
      "as a LinkedIn comment.Please provide a thoughtful and relevant reply that adds value to the conversation, considering the post content and the user's draft comment if provided. The reply should be professional, engaging, and appropriate for a LinkedIn audience.",
  }

  // Create the prompt based on the mappings and provided inputs
  const prompt = `Please write a reply in ${language} to the following text "${originalText}" with the general content "${replyContent}", ${toneMapping[tone]}, ${lengthMapping[length]}, ${formatMapping[format]}.`

  return prompt
}
