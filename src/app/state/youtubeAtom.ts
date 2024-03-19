import { atom } from 'jotai'

type YoutubeVideoData = { url: string; title: string } | null

export const youtubeVideoDataAtom = atom<YoutubeVideoData>(null)
