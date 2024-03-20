import { SetStateAction, atom } from 'jotai'
export const LANGUAGE_KEY = 'language' // from i18next-browser-languagedetector

const languageStrAtom = atom(localStorage.getItem(LANGUAGE_KEY) ?? undefined)

export const languageAtom = atom<string | undefined, [SetStateAction<string | undefined>], void>(
  (get) => get(languageStrAtom),
  (get, set, newStr) => {
    const nextValue = typeof newStr === 'function' ? newStr(get(languageStrAtom)) : newStr
    set(languageStrAtom, nextValue)
    if (!nextValue) {
      localStorage.removeItem(LANGUAGE_KEY)
    } else {
      localStorage.setItem(LANGUAGE_KEY, nextValue)
    }
  },
)
