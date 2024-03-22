import i18n from '~app/i18n'
import { getLanguagePrompt } from './buildPromptWithLang'

export const buildPromptWithLang = (prompt: string): string => {
  const lang = i18n.language

  const languagePrompt = getLanguagePrompt(lang)
  if (!languagePrompt) {
    return prompt
  }
  return prompt + `. Pls reponse in "${languagePrompt}" language.`
}
