import { PostData } from '~types'
import { FormatWritingType } from './writing'

export type SidePanelMessageType = {
  content: string | null
  postData: PostData | null
  link: string
  title: string
  type: 'summary-web-content' | 'summary-youtube-videos' | 'writing-assistant' | 'explain-a-concept'
  subType: 'compose' | 'reply' | null
  noteId?: string
  format?: FormatWritingType
}
