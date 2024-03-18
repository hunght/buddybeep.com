import { useEffect, useState } from 'react'

// Inject to the webpage itself
import './google-sidebar-base.css'

import { getDocumentTextFromDOM } from '~content-script/helper/dom'

// Inject into the ShadowDOM

const GoogleSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true)

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
              <button
                style={{ cursor: 'pointer', padding: 0 }}
                type="button"
                onClick={async () => {
                  await chrome.runtime.sendMessage({
                    action: 'openSidePanel',
                    content: getDocumentTextFromDOM(),
                    link: window.location.href,
                    title: document.title,
                  })
                  console.log(`==== window.location.href ===`)
                  console.log(window.location.href)
                  console.log('==== end log ===')
                }}
              >
                <div
                  style={{
                    backgroundColor: 'rgb(99, 102, 241)',
                    alignItems: 'center',
                    textAlign: 'center',
                    justifyContent: 'center',
                    display: 'flex',
                    padding: '0px 5px',
                    flexDirection: 'row',
                    gap: '5px',
                  }}
                >
                  <span style={{ color: 'white' }}>Sum</span>
                  <img src={chrome.runtime.getURL('src/assets/icon.png')} style={{ width: 25, height: 25 }} />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default GoogleSidebar
