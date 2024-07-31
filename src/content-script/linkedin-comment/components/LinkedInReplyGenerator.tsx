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
      action: 'generateLinkedInReply',
      content: commentText,
      link: window.location.href,
      title: document.title,
      postData: postData, // Include the post data for context
    })
  }

  const getCommentText = (): string => {
    const editor = commentBox.querySelector('.ql-editor')
    return editor ? editor.textContent || '' : ''
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

const LinkedInReplyGenerator: React.FC = () => {
  const processedBoxes = useRef(new Set<Element>())

  const getPostData = (commentBox: Element): PostData => {
    const post = commentBox.closest('.feed-shared-update-v2')
    if (!post) return {} as PostData

    const authorName = post.querySelector('.update-components-actor__name')?.textContent?.trim() || ''
    const authorHeadline = post.querySelector('.update-components-actor__description')?.textContent?.trim() || ''
    const postContentElement = post.querySelector('.feed-shared-update-v2__description')
    let postContent = ''

    if (postContentElement) {
      // Remove the "...more" button if present
      const moreButton = postContentElement.querySelector('.feed-shared-inline-show-more-text__see-more-less-toggle')
      if (moreButton) {
        moreButton.remove()
      }
      postContent = postContentElement.textContent?.trim() || ''
    }

    const postTimestamp = post.querySelector('.update-components-actor__sub-description')?.textContent?.trim() || ''

    return { authorName, authorHeadline, postContent, postTimestamp }
  }

  const injectReplyButtons = () => {
    const commentBoxes = document.querySelectorAll('.comments-comment-box__form-container')
    commentBoxes.forEach((box) => {
      if (!processedBoxes.current.has(box)) {
        const container = document.createElement('div')
        container.className = 'buddy-beep-reply-container'
        box.appendChild(container)
        const postData = getPostData(box)
        ReactDOM.createRoot(container).render(<GenerateReplyButton commentBox={box} postData={postData} />)
        processedBoxes.current.add(box)
      }
    })
  }

  useEffect(() => {
    const observer = new MutationObserver(injectReplyButtons)
    observer.observe(document.body, { childList: true, subtree: true })
    injectReplyButtons() // Initial injection
    return () => {
      observer.disconnect()
      processedBoxes.current.clear()
    }
  }, [])

  return null
}

export default LinkedInReplyGenerator
