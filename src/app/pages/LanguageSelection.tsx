import { useCallback, useMemo, useState } from 'react'
import Select from '~app/components/Select'
import { getLanguage, setLanguage } from '~services/storage/language'
import i18n, { languageCodes } from '~app/i18n'
import { trackEvent } from '~app/plausible'
import { t } from 'i18next'

export const LanguageSelection: React.FunctionComponent = () => {
  const [lang, setLang] = useState(() => getLanguage() || 'auto')

  const languageOptions = useMemo(() => {
    const nameGenerator = new Intl.DisplayNames('en', { type: 'language' })
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
      setLanguage(lang === 'auto' ? undefined : lang)
      i18n.changeLanguage(lang === 'auto' ? undefined : lang)

      trackEvent('change_language', { lang })
    },
    [i18n],
  )
  return (
    <Select
      options={[{ name: t('Auto'), value: 'auto' }, { name: 'English', value: 'en' }, ...languageOptions]}
      value={lang}
      onChange={onLanguageChange}
    />
  )
}
