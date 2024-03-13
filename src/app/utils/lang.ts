import i18n from '~app/i18n'

export const buildPromptWithLang = (prompt: string): string => {
  const lang = i18n.language
  console.log(`==== lang ===`)
  console.log(lang)
  console.log('==== end log ===')
  if (lang !== 'en') {
    return prompt + ` [lang:${lang}]`
  }
  return prompt
}
