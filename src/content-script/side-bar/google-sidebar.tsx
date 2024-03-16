import { useEffect, useState } from 'react'

// Inject to the webpage itself
import './google-sidebar-base.css'

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
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? '🟡 Đóng' : '🟣 Mở'}
          </button>

          <hr />

          <hr />

          <hr />

          <hr />

          <button
            style={{
              marginTop: 100,
              padding: 10,
              cursor: 'pointer',
              backgroundColor: 'transparent',
              color: 'white',
              border: 0,
              textDecoration: 'underline',
            }}
            onClick={() => {
              window.open('https://www.facebook.com/groups/750671923274695')
            }}
          >
            Mọi thắc mắc vui lòng liên hệ với chúng tôi qua Facebook
          </button>
        </div>
      </div>
    </div>
  )
}
export default GoogleSidebar
