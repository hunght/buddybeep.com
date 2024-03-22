export const getLanguagePrompt = (lang: string | null): string | null => {
  let languagePrompt = null
  if (lang !== 'en') {
    switch (lang) {
      case 'vi':
        languagePrompt = 'Tiếng Việt'
        break
      case 'zh-CN':
        languagePrompt = '简体中文'
        break
      case 'zh-TW':
        languagePrompt = '繁體中文'
        break
      case 'pt':
        languagePrompt = 'Português'
        break
      case 'es':
        languagePrompt = 'Español'
        break
      case 'de':
        languagePrompt = 'Deutsch'
        break
      case 'fr':
        languagePrompt = 'Français'
        break
      case 'ja':
        languagePrompt = '日本語'
        break
      case 'th':
        languagePrompt = 'ไทย'
        break
      case 'in':
        languagePrompt = 'Bahasa Indonesia'
        break
      default:
        return null
    }
  }
  return languagePrompt
}
