import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import ReactDOM from 'react-dom/client'
import { PostData } from '~types/chat'
import { IoClose } from 'react-icons/io5'
import { logoBase64 } from '~app/utils/logo'

const GenerateReplyButton: React.FC<{ commentBox: Element; postData: PostData }> = ({ commentBox, postData }) => {
  const { t } = useTranslation()
  const [isPermanentlyClosed, setIsPermanentlyClosed] = useState(false)

  const generateReply = async (commentText: string) => {
    chrome.runtime.sendMessage({
      action: 'generateRedditReply',
      content: commentText,
      link: window.location.href,
      title: document.title,
      postData: postData, // Include the post data for context
    })
  }

  const getCommentText = (): string => {
    return commentBox.textContent || ''
  }
  const handleGenerate = () => {
    const commentText = getCommentText()
    generateReply(commentText)
  }

  const handlePermanentClose = () => {
    setIsPermanentlyClosed(true)
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  }

  const buttonBaseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 12px',
    border: 'none',
    borderRadius: '16px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  }

  const replyButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#0a66c2',
    color: 'white',
  }

  const closeButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#f3f2ef',
    color: '#666',
    padding: '6px',
    minWidth: '28px',
    minHeight: '28px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }

  const logoStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    marginRight: '8px',
  }

  if (isPermanentlyClosed) {
    return null
  }

  return (
    <div style={containerStyle}>
      <button
        style={replyButtonStyle}
        onClick={handleGenerate}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#004182')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0a66c2')}
      >
        <img src={logoBase64} alt="Logo" style={logoStyle} />
        {t('Generate Reply')}
      </button>
      <button
        style={closeButtonStyle}
        onClick={handlePermanentClose}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e1e1e1')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f3f2ef')}
        aria-label={t('Close')}
      >
        <IoClose size={16} />
      </button>
    </div>
  )
}

const RedditReplyGenerator: React.FC = () => {
  const processedBoxes = useRef(new Set<Element>())

  const getPostData = (commentBox: Element): PostData => {
    const post = commentBox.closest('faceplate-form')
    if (!post) return {} as PostData

    const authorName = post.querySelector('data[slot="rte"][value="redditor"]')?.getAttribute('data-name') || ''
    const authorHeadline = '' // Reddit doesn't have headlines for users
    const postContentElement = post.querySelector('shreddit-composer')
    const postContent = postContentElement ? postContentElement.textContent?.trim() || '' : ''
    const postTimestamp = post.querySelector('time')?.getAttribute('datetime') || ''

    return { authorName, authorHeadline, postContent, postTimestamp }
  }

  const injectReplyButtons = () => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const commentBoxes = document.querySelectorAll(
            'div[contenteditable="true"][role="textbox"][data-lexical-editor="true"]',
          )
          console.log('commentBoxes', commentBoxes)
          commentBoxes.forEach((box) => {
            if (!processedBoxes.current.has(box)) {
              const container = document.createElement('div')
              container.className = 'buddy-beep-reply-container'
              container.style.marginTop = '8px'

              box.parentNode?.insertBefore(container, box.nextSibling)

              const postData = getPostData(box.closest('faceplate-form') || box)
              ReactDOM.createRoot(container).render(<GenerateReplyButton commentBox={box} postData={postData} />)
              processedBoxes.current.add(box)
            }
          })
        }
      })
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }

  useEffect(() => {
    injectReplyButtons()
  }, [])

  return null
}

export default RedditReplyGenerator
