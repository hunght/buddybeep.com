import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import ReactDOM from 'react-dom/client'
import { PostData } from '~types/chat'

const GenerateReplyButton: React.FC<{ commentBox: Element; postData: PostData }> = ({ commentBox, postData }) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(true)
  const [generatedReply, setGeneratedReply] = useState('')
  const [isPermanentlyClosed, setIsPermanentlyClosed] = useState(false)

  const generateReply = async (commentText: string) => {
    const response = await chrome.runtime.sendMessage({
      action: 'generateLinkedInReply',
      content: commentText,
      link: window.location.href,
      title: document.title,
      postData: postData, // Include the post data for context
    })
    if (response && response.reply) {
      setGeneratedReply(response.reply)
      setIsOpen(true)
    }
  }
  const handleOneTimeClose = () => {
    setIsOpen(false)
  }
  const getCommentText = (): string => {
    const editor = commentBox.querySelector('.ql-editor')
    return editor ? editor.textContent || '' : ''
  }
  const handleGenerate = () => {
    const commentText = getCommentText()
    generateReply(commentText)
  }

  const handleUseReply = () => {
    const editor = commentBox.querySelector('.ql-editor')
    if (editor) {
      editor.innerHTML = `<p>${generatedReply}</p>`
      editor.dispatchEvent(new Event('input', { bubbles: true }))
      setIsOpen(false)
    }
  }

  const handlePermanentClose = () => {
    setIsPermanentlyClosed(true)
    setIsOpen(false)
  }

  if (isPermanentlyClosed) {
    return null
  }

  return (
    <div className="buddy-beep-reply-container">
      <button className="buddy-beep-reply-button" onClick={handleGenerate}>
        {t('Generate Reply')}
      </button>
      <button onClick={() => setIsOpen(!isOpen)} className={`buddy-beep-toggle-button ${isOpen ? 'active' : ''}`}>
        {isOpen ? t('Hide') : t('Show')}
      </button>
      {isOpen && (
        <div className="buddy-beep-reply-collapse">
          <button onClick={handleOneTimeClose}>{t('Close One Time')}</button>
          <button onClick={handlePermanentClose}>{t('Close Permanently')}</button>
        </div>
      )}
    </div>
  )
}

const LinkedInReplyGenerator: React.FC = () => {
  const processedBoxes = useRef(new Set<Element>())

  const getPostData = (commentBox: Element): PostData => {
    const post = commentBox.closest('.feed-shared-update-v2')
    if (!post) return {} as PostData

    const authorName = post.querySelector('.feed-shared-actor__name')?.textContent?.trim() || ''
    const authorHeadline = post.querySelector('.feed-shared-actor__description')?.textContent?.trim() || ''
    const postContent = post.querySelector('.feed-shared-update-v2__description')?.textContent?.trim() || ''
    const postTimestamp = post.querySelector('.feed-shared-actor__sub-description')?.textContent?.trim() || ''

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
