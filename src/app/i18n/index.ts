import i18n, { Resource } from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import french from './locales/french.json'
import german from './locales/german.json'
import indonesia from './locales/indonesia.json'
import japanese from './locales/japanese.json'
import portuguese from './locales/portuguese.json'
import simplifiedChinese from './locales/simplified-chinese.json'
import spanish from './locales/spanish.json'
import thai from './locales/thai.json'
import vietnamese from './locales/vietnamese.json'
import traditionalChinese from './locales/traditional-chinese.json'
import { LANGUAGE_KEY } from '~app/state/langAtom'

const resources: Resource = {
  'zh-CN': { translation: simplifiedChinese },
  'zh-TW': { translation: traditionalChinese },
  es: { translation: spanish },
  pt: { translation: portuguese },
  ja: { translation: japanese },
  de: { translation: german },
  fr: { translation: french },
  in: { translation: indonesia },
  th: { translation: thai },
  vi: { translation: vietnamese },
}

export const languageCodes = Object.keys(resources)

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    lng: localStorage.getItem(LANGUAGE_KEY) || undefined,
    fallbackLng: 'en',
    resources,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      order: ['navigator'],
      caches: [],
      convertDetectedLanguage: 'Iso15897',
    },
  })

export default i18n
