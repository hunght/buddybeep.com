export type SidePanelMessageType = {
  content: string | null
  link: string
  title: string
  type: 'summary-web-content' | 'summary-youtube-videos' | 'writing-assistant' | 'explain-a-concept'
  subType: 'compose' | 'reply' | null
}
