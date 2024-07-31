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
      action: 'generateYouTubeReply',
      content: commentText,
      link: window.location.href,
      title: document.title,
      postData: postData,
    })
  }

  const getCommentText = (): string => {
    const editor = commentBox.querySelector('#contenteditable-root')
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
    borderRadius: '18px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  }

  const replyButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#065fd4',
    color: 'white',
  }

  const closeButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#f2f2f2',
    color: '#606060',
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
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0456bf')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#065fd4')}
      >
        <img src={logoBase64} alt="Logo" style={logoStyle} />
        {t('Generate Reply')}
      </button>
      <button
        style={closeButtonStyle}
        onClick={handlePermanentClose}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e5e5')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f2f2f2')}
        aria-label={t('Close')}
      >
        <IoClose size={16} />
      </button>
    </div>
  )
}

export const YouTubeReplyGenerator: React.FC = () => {
  const processedBoxes = useRef(new Set<Element>())

  const getPostData = (commentBox: Element): PostData => {
    const videoTitle = document.querySelector('h1.ytd-watch-metadata')?.textContent || ''
    const channelName = document.querySelector('#text.ytd-channel-name')?.textContent || ''
    const videoDescription = document.querySelector('#description-inline-expander')?.textContent || ''

    return { videoTitle, channelName, videoDescription }
  }

  const injectReplyButtons = () => {
    const commentBoxes = document.querySelectorAll('ytd-comment-simplebox-renderer')
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
