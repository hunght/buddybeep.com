import { atom } from 'jotai'
export const LANGUAGE_KEY = 'language' // from i18next-browser-languagedetector

export const languageAtom = atom<string | undefined>(undefined)
