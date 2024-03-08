import { CHAT_STATE_STORAGE } from '~app/consts'

import { SetStateAction, atom } from 'jotai'
import { ChatState } from '~app/types/chatState'

type ChatStateHash = Record<string, ChatState | null>

export const atomChatStateLocalStorage = () => {
  const getInitialValue = (): ChatStateHash => {
    const item = localStorage.getItem(CHAT_STATE_STORAGE)
    if (item !== null) {
      return JSON.parse(item)
    }
    return {}
  }

  const baseAtom = atom(getInitialValue())
  const derivedAtom = atom<ChatStateHash, [SetStateAction<ChatStateHash>], void>(
    (get) => get(baseAtom),
    (get, set, update) => {
      const nextValue = typeof update === 'function' ? update(get(baseAtom)) : update
      set(baseAtom, nextValue)
      localStorage.setItem(CHAT_STATE_STORAGE, JSON.stringify(nextValue))
    },
  )
  return derivedAtom
}
export const chatStatesArrayAtomValue = atom((get) => {
  const result: ChatState[] = []
  Object.values(get(atomChatStateLocalStorage())).forEach((chatState) => {
    if (chatState) {
      result.push(chatState)
    }
  })
  return result
})
