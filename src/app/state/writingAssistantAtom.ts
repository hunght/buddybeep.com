import { atom } from 'jotai'
import { FormatWritingType } from '~app/types/writing'

export const langAtom = atom('en')

export const formatAtom = atom<FormatWritingType>('comment')

export const toneAtom = atom<'formal' | 'casual' | 'professional' | 'enthusiastic' | 'informational' | 'funny'>(
  'formal',
)

export const lengthAtom = atom<'short' | 'medium' | 'long'>('short')

export const replyContentAtom = atom('')
export const originalTextAtom = atom('')
