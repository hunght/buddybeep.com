import { FC, useCallback, useMemo } from 'react'
import Select from '~app/components/Select'

import i18n, { languageCodes } from '~app/i18n'
import { trackEvent } from '~app/plausible'
import { t } from 'i18next'
import { useAtom } from 'jotai'
import { languageAtom } from '~app/state/langAtom'
import { GrLanguage } from 'react-icons/gr'
import { cx } from '~utils'

export const LanguageSelection: FC<{ className?: string }> = ({ className }) => {
  const [lang, setLang] = useAtom(languageAtom)
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

      i18n.changeLanguage(lang === 'auto' ? undefined : lang)

      trackEvent('change_language', { lang })
    },
    [i18n],
  )
  return (
    <div className="flex items-center gap-1">
      <GrLanguage className="p-1 rounded text-2xl" />
      <div className="flex-1">
        <Select
          options={[{ name: t('Auto'), value: 'auto' }, { name: 'English', value: 'en' }, ...languageOptions]}
          value={lang ?? 'auto'}
          onChange={onLanguageChange}
        />
      </div>
    </div>
  )
}
