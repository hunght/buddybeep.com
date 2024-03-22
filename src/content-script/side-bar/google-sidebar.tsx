import { useEffect, useState } from 'react'

// Inject to the webpage itself
import './google-sidebar-base.css'

import { getDocumentTextFromDOM } from '~content-script/helper/dom'
import { useTranslation } from 'react-i18next'

// Inject into the ShadowDOM

const GoogleSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true)
  const { t } = useTranslation()
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
        <div id="sidebar">
          {isOpen && (
            <div className="sidebar-toggle">
              <span
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'color 0.3s',
                  backgroundColor: 'rgba(0, 0, 0,0.5)',
                  position: 'absolute',
                  top: '-7px',
                  left: '-7px',
                  borderRadius: '50%',
                  width: '15px',
                  height: '15px',
                  alignItems: 'center',
                  alignContent: 'center',
                  textAlign: 'center',
                  fontSize: '12px',
                }}
                onClick={() => {
                  setIsOpen(false)
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'rgb(255, 192, 203)' // Pink color on hover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'white' // Reset to white
                }}
              >
                X
              </span>

              <div
                onMouseEnter={(e) => {
                  // change to indigo color

                  e.currentTarget.style.backgroundColor = '#4B0082' // Pink color on hover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgb(99, 102, 241)' // Reset to white
                }}
                style={{
                  backgroundColor: 'rgb(99, 102, 241)',

                  alignItems: 'center',
                  textAlign: 'center',
                  justifyContent: 'center',
                  display: 'flex',
                  padding: '4px 8px',
                  flexDirection: 'row',
                  gap: '5px',
                  borderRadius: '24px',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
                  cursor: 'pointer',
                }}
                onClick={async () => {
                  const prompt = `Get key points from web:Title:${document.title},Link:${window.location.href} content:${getDocumentTextFromDOM()}`
                  await chrome.runtime.sendMessage({
                    action: 'openSidePanel',
                    content: prompt,
                    link: window.location.href,
                    title: document.title,
                    type: 'summary-web-content',
                  })
                }}
              >
                <span style={{ color: 'white' }}>{chrome.i18n.getMessage('ask')}</span>
                <img src={chrome.runtime.getURL('src/assets/icon.png')} style={{ width: 25, height: 25 }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default GoogleSidebar
