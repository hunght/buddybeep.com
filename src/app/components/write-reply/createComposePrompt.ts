export function createComposePrompt({
  topic,
  tone,
  length,
  format,
  language,
}: {
  topic: string
  tone: string
  length: string
  format: string
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
    essay: 'as an essay',
    paragraph: 'as a paragraph',
    email: 'as an email',
    idea: 'as an idea pitch',
    blog_post: 'as a blog post',
    outline: 'as an outline',
    marketing_ads: 'as a marketing ad',
    comment: 'as a comment',
    message: 'as a direct message',
    twitter: 'as a tweet',
  }

  // Create the prompt based on the mappings and provided inputs
  const prompt = `Please compose a message on the topic "${topic}", ${toneMapping[tone]}, ${lengthMapping[length]}, ${formatMapping[format]}, in ${language}.`

  return prompt
}
