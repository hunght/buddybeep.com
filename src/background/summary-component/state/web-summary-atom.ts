import { atom } from 'jotai'

export const webSummaryAtom = atom<{ option: 'article' | 'selection' | 'full-page' }>({
  option: 'article',
})
