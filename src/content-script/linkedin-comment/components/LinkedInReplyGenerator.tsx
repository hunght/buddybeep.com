import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

const LinkedInReplyGenerator: React.FC = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const generateReply = async (commentText: string) => {
    const response = await chrome.runtime.sendMessage({
      action: 'generateLinkedInReply',
      content: commentText,
    })
    if (response && response.reply) {
      const textarea = document.querySelector('.comments-comment-box__form-container textarea') as HTMLTextAreaElement
      if (textarea) {
        textarea.value = response.reply
        textarea.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }
  }

  const injectReplyButton = () => {
    const commentBoxes = document.querySelectorAll('.comments-comment-box__form-container')
    commentBoxes.forEach((box) => {
      if (!box.querySelector('.buddy-beep-reply-button')) {
        const button = document.createElement('button')
        button.textContent = t('Generate Reply')
        button.className = 'buddy-beep-reply-button'
        button.addEventListener('click', () => {
          const commentText = (box.querySelector('textarea') as HTMLTextAreaElement).value
          generateReply(commentText)
        })
        box.appendChild(button)
      }
    })
  }

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      if (isOpen) {
        injectReplyButton()
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [isOpen])

  return (
    <div className="buddy-beep-linkedin-widget">
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? t('Disable Reply Generator') : t('Enable Reply Generator')}
      </button>
    </div>
  )
}

export default LinkedInReplyGenerator
