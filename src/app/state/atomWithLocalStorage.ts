import { CHAT_STATE_STORAGE } from '~app/consts'

import { atom } from 'jotai'
import { ChatState } from '~app/types/chatState'
import { atomWithStorage } from 'jotai/utils'

type ChatStateHash = Record<string, ChatState | null>

export const atomChatStateLocalStorage = atomWithStorage(CHAT_STATE_STORAGE, {} as ChatStateHash)

export const chatStatesArrayAtomValue = atom((get) => {
  const result: ChatState[] = []
  Object.values(get(atomChatStateLocalStorage)).forEach((chatState) => {
    if (chatState) {
      result.push(chatState)
    }
  })
  // sort by last message time
  return result.sort((a, b) => {
    const aTime = a.lastMessage?.time ? Number(a.lastMessage.time) : 0
    const bTime = b.lastMessage?.time ? Number(b.lastMessage.time) : 0
    return bTime - aTime
  })
})
