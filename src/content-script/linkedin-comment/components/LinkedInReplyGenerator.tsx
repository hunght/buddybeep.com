import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import ReactDOM from 'react-dom/client'

const GenerateReplyButton: React.FC<{ commentBox: Element }> = ({ commentBox }) => {
  const { t } = useTranslation()

  const generateReply = async (commentText: string) => {
    const response = await chrome.runtime.sendMessage({
      action: 'generateLinkedInReply',
      content: commentText,
    })
    if (response && response.reply) {
      const textarea = commentBox.querySelector('textarea') as HTMLTextAreaElement
      if (textarea) {
        textarea.value = response.reply
        textarea.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }
  }

  const handleClick = () => {
    const commentText = (commentBox.querySelector('textarea') as HTMLTextAreaElement).value
    generateReply(commentText)
  }

  return (
    <button className="buddy-beep-reply-button" onClick={handleClick}>
      {t('Generate Reply')}
    </button>
  )
}

const LinkedInReplyGenerator: React.FC = () => {
  const processedBoxes = useRef(new Set<Element>())

  const injectReplyButtons = () => {
    const commentBoxes = document.querySelectorAll('.comments-comment-box__form-container')
    commentBoxes.forEach((box) => {
      if (!processedBoxes.current.has(box)) {
        const container = document.createElement('div')
        container.className = 'buddy-beep-reply-container'
        box.appendChild(container)
        ReactDOM.createRoot(container).render(<GenerateReplyButton commentBox={box} />)
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
