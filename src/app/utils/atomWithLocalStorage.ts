import { CHAT_STATE_STORAGE } from '~app/consts'

import { atom } from 'jotai'
import { ChatState } from '~app/hooks/type'

export const atomChatStateLocalStorage = () => {
  const getInitialValue = (): Record<string, ChatState> => {
    const item = localStorage.getItem(CHAT_STATE_STORAGE)
    if (item !== null) {
      return JSON.parse(item)
    }
    return {}
  }
  const baseAtom = atom<Record<string, ChatState>>(getInitialValue())
  const derivedAtom = atom(
    (get) => get(baseAtom),
    (get, set, update) => {
      const nextValue = typeof update === 'function' ? update(get(baseAtom)) : update
      set(baseAtom, nextValue)
      localStorage.setItem(CHAT_STATE_STORAGE, JSON.stringify(nextValue))
    },
  )
  return derivedAtom
}
export const chatStatesArrayAtomValue = atom((get) =>
  Object.values(get(atomChatStateLocalStorage())).filter((state) => !!state),
)
