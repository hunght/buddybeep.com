import { useEffect, useState } from 'react'

// Inject to the webpage itself
import './google-sidebar-base.css'

import { getDocumentTextFromDOM } from '~content-script/helper/dom'

// Inject into the ShadowDOM

const GoogleSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    document.body.classList.toggle('plasmo-google-sidebar-show', !isOpen)
  }, [isOpen])

  const isPrintLayout = document.body.id === 'print-layout'
  if (isPrintLayout) {
    return <div />
  }

  return (
    <div
      style={{
        zIndex: 2147483647,
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: '0px',
          left: '0px',
        }}
      >
        <div id="sidebar" className={isOpen ? 'open' : 'closed'}>
          <button
            style={{ cursor: 'pointer' }}
            type="button"
            className="sidebar-toggle"
            onClick={async () => {
              const respone = await chrome.runtime.sendMessage({
                action: 'openSidePanel',
                text: getDocumentTextFromDOM(),
              })
            }}
          >
            {isOpen ? 'Sum' : '🟣 Mở'}
          </button>
        </div>
      </div>
    </div>
  )
}
export default GoogleSidebar
