import { FC, useMemo } from 'react'
import Select from '~app/components/Select'

import { languageCodes } from '~app/i18n'

import { t } from 'i18next'

export const LanguageWritingSelection: FC<{
  lang: string | null
  onLanguageChange: (lang: string) => void
}> = ({ onLanguageChange, lang }) => {
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

  return (
    <Select
      options={[{ name: t('Auto'), value: 'auto' }, { name: 'English', value: 'en' }, ...languageOptions]}
      value={lang ?? 'auto'}
      onChange={onLanguageChange}
      position="top"
    />
  )
}
