import { useEffect, useState } from 'react'

// Inject to the webpage itself
import './google-sidebar-base.css'

import { getStyledHtml } from '~content-script/helper/dom'
import { useTranslation } from 'react-i18next'

const GoogleSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [currentNodeSelected, setCurrentNodeSelected] = useState<HTMLElement | null>(null)
  const { t } = useTranslation()
  const isPrintLayout = document.body.id === 'print-layout'
  const [selectedOption, setSelectedOption] = useState('article')

  useEffect(() => {
    // Inject into the ShadowDOM
    if (selectedOption !== 'selection') {
      return
    }
    function highlightTextSelection(event: { target: any }) {
      const hoveredElement = event.target
      if (hoveredElement) {
        setCurrentNodeSelected(hoveredElement)
      }
    }
    document.addEventListener('mouseover', highlightTextSelection)

    return () => {
      document.removeEventListener('mouseover', highlightTextSelection)
    }
  }, [selectedOption])

  useEffect(() => {
    if (!currentNodeSelected) {
      return
    }

    const shadowHost = document.getElementById('buddy-beep-google-sidebar')?.shadowRoot

    const overlay = shadowHost?.getElementById('buddy-beep-overlay-hole') ?? null
    updateOverlay()
    window.addEventListener('resize', updateOverlay) // Update on resize
    window.addEventListener('scroll', updateOverlay) // Update on scroll

    function updateOverlay() {
      if (!overlay || !currentNodeSelected) {
        return
      }

      const rect = currentNodeSelected.getBoundingClientRect()

      overlay.style.top = `${rect.top + window.scrollY}px`
      overlay.style.left = `${rect.left + window.scrollX}px`
      overlay.style.width = `${rect.width}px`
      overlay.style.height = `${rect.height}px`
    }
    return () => {
      window.removeEventListener('resize', updateOverlay)
      window.removeEventListener('scroll', updateOverlay)
    }
  }, [currentNodeSelected])

  // Function to handle option selection
  const handleSelectOption = (option: string) => {
    setSelectedOption(option)
  }
  useEffect(() => {
    if (selectedOption === 'selection') {
      return
    }
    if (selectedOption === 'article') {
      // find article in document
      const article = document.querySelector('article')
      if (!article) {
        // find main in document
        const main = document.querySelector('main')
        setCurrentNodeSelected(main)
      }
      setCurrentNodeSelected(article)
      return
    }
    if (selectedOption === 'full-page') {
      const body = document.querySelector('body')
      setCurrentNodeSelected(body)
    }
  }, [selectedOption])

  useEffect(() => {
    const existingElement = document.getElementById('buddy-beep-google-sidebar')
    if (existingElement) {
      existingElement.style.display = isOpen ? 'block' : 'none'
    }
    if (!isOpen) {
    }
  }, [isOpen])

  if (isPrintLayout) {
    return <div />
  }

  return (
    <div
      style={{
        zIndex: 2147483647,
        position: 'relative',
        backgroundColor: 'red',
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
        <div id="buddy-beep-overlay-container">
          <div id="buddy-beep-overlay">
            <div id="buddy-beep-overlay-hole">
              <div
                style={{
                  width: '44px',
                  alignSelf: 'center',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  pointerEvents: 'visible',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  display: 'flex',
                  marginTop: -10,
                }}
              >
                <button
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: 'gray',
                    fontWeight: 'bold',
                    color: 'white',
                    textAlign: 'center',
                    padding: 0,
                    paddingBottom: 2,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    //find parent note of current node
                    const parent = currentNodeSelected?.parentElement
                    console.log(`==== currentNodeSelected ===`)
                    console.log(currentNodeSelected)
                    console.log('==== end log ===')

                    if (parent) {
                      setCurrentNodeSelected(parent)
                    }
                  }}
                >
                  +
                </button>
                <button
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: 'gray',
                    fontWeight: 'bold',
                    color: 'white',
                    textAlign: 'center',
                    padding: 0,
                    paddingBottom: 4,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    //find first child note of current node
                    const child = currentNodeSelected?.children[0]

                    if (child) {
                      setCurrentNodeSelected(child)
                    }
                  }}
                >
                  -
                </button>
              </div>
            </div>
          </div>
        </div>
        <div id="sidebar">
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
                padding: '4px 6px',
                flexDirection: 'row',
                gap: '5px',
                borderRadius: '24px',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
                cursor: 'pointer',
                color: 'white',
              }}
              onClick={async () => {
                const content = getStyledHtml(currentNodeSelected)
                console.log(`==== content ===`)
                console.log(content)
                console.log(currentNodeSelected)
                console.log('==== end log ===')

                await chrome.runtime.sendMessage({
                  action: 'openSidePanel',
                  content,
                  link: window.location.href,
                  title: document.title,
                  type: 'summary-web-content',
                })
                setIsOpen(false)
              }}
            >
              {t('Summary')}

              <img src={chrome.runtime.getURL('src/assets/logo-64.png')} style={{ width: 25, height: 25 }} />
            </div>
            <ul>
              <li
                className={selectedOption === 'article' ? 'selected' : ''}
                onClick={() => {
                  handleSelectOption('article')
                }}
              >
                Article
              </li>
              <li
                className={selectedOption === 'selection' ? 'selected' : ''}
                onClick={() => {
                  handleSelectOption('selection')
                }}
              >
                Selection
              </li>
              <li
                className={selectedOption === 'full-page' ? 'selected' : ''}
                onClick={() => handleSelectOption('full-page')}
              >
                Full Page
              </li>
            </ul>

            <span style={{ fontSize: 12, marginLeft: 5, color: 'white' }}>{`${t('Title')}: ` + document.title}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
export default GoogleSidebar
