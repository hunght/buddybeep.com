import { FC, useCallback, useEffect, useMemo } from 'react'
import Select from '~app/components/Select'

import i18n, { languageCodes } from '~app/i18n'
import { trackEvent } from '~app/plausible'
import { t } from 'i18next'

import { LANGUAGE_KEY, languageAtom } from '~app/state/langAtom'
import { useAtom } from 'jotai'
const translations = [
  { value: 'zh-CN', name: '🇨🇳' },
  { value: 'zh-TW', name: '🇹🇼' },
  { value: 'es', name: '🇪🇸' },
  { value: 'pt', name: '🇵🇹' },
  { value: 'ja', name: '🇯🇵' },
  { value: 'de', name: '🇩🇪' },
  { value: 'fr', name: '🇫🇷' },
  { value: 'in', name: '🇮🇩' },
  { value: 'th', name: '🇹🇭' },
  { value: 'vi', name: '🇻🇳' },
  { value: 'auto', name: '🌐' },
]

export const LanguageSelection: FC<{ position?: 'top' | 'down'; short: boolean }> = ({ position, short }) => {
  const [lang, setLang] = useAtom(languageAtom)

  useEffect(() => {
    chrome.storage.local.get(LANGUAGE_KEY, (data) => {
      setLang(data[LANGUAGE_KEY])
    })
  }, [])

  const languageOptions = useMemo(() => {
    const nameGenerator = new Intl.DisplayNames('en', { type: 'language' })
    // make short version of language coutry flag

    return languageCodes.map((code) => {
      let name: string
      if (code === 'zh-CN') {
        name = '简体中文'
      } else if (code === 'zh-TW') {
        name = '繁體中文'
      } else {
        name = nameGenerator.of(code) || code
      }
      return { name, value: code }
    })
  }, [])

  const onLanguageChange = useCallback(
    (lang: string) => {
      setLang(lang)
      if (!lang) {
        chrome.storage.local.remove(LANGUAGE_KEY)
      } else {
        chrome.storage.local.set({ [LANGUAGE_KEY]: lang })
      }

      i18n.changeLanguage(lang === 'auto' ? undefined : lang)

      trackEvent('change_language', { lang })
    },
    [i18n],
  )
  const options = short
    ? translations
    : [{ name: t('Auto'), value: 'auto' }, { name: 'English', value: 'en' }, ...languageOptions]
  return <Select position={position} options={options} value={lang ?? 'auto'} onChange={onLanguageChange} />
}
