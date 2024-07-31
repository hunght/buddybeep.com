import { PostData } from '~types'

export function generatePromptFromPostData(postData: PostData): string {
  return `Following post:
Author: ${postData.authorName}
Author Headline: ${postData.authorHeadline}
Post Content: ${postData.postContent}
Posted at: ${postData.postTimestamp}
`
}
