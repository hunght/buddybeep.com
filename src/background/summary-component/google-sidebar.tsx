import { useEffect, useState } from 'react'

// Inject to the webpage itself
import './google-sidebar-base.css'

import { getDocumentTextFromDOM, getStyledHtml } from '~content-script/helper/dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '~lib/supabase/client'
let currentNodeSelected: HTMLElement | null = null
// Inject into the ShadowDOM
function highlightTextSelection() {
  if (currentNodeSelected) {
    currentNodeSelected.classList.remove('buddy-beep-highlight-border')
  }
  const selection = window.getSelection()
  if (!selection || selection.toString().trim() === '') return

  const range = selection.getRangeAt(0)
  if (range && range.commonAncestorContainer) {
    const commonAncestorContainer = range.commonAncestorContainer
    const selectedElement =
      commonAncestorContainer.nodeType === 3 ? commonAncestorContainer.parentNode : range.commonAncestorContainer

    addHighlightBorder(selectedElement)
  }
}

const removeHighlightSelections = function (): void {
  // Find all elements with the 'buddy-beep-highlight-border' class
  const highlightedElements = document.querySelectorAll('.buddy-beep-highlight-border')

  // Remove the class from all such elements
  highlightedElements.forEach(function (element) {
    element.classList.remove('buddy-beep-highlight-border')
  })
}

// Function to add text selection highlight listener
function addHighlightListener() {
  document.addEventListener('mouseup', highlightTextSelection)
  // To remove the highlight, you can define another event listener as mentioned
}

// Function to remove text selection highlight listener
function removeHighlightListener() {
  document.removeEventListener('mouseup', highlightTextSelection)
}

const GoogleSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true)
  const { t } = useTranslation()
  const isPrintLayout = document.body.id === 'print-layout'
  const [selectedOption, setSelectedOption] = useState('article')

  // Function to handle option selection
  const handleSelectOption = (option: string) => {
    setSelectedOption(option)
  }
  useEffect(() => {
    removeHighlightListener()
    removeHighlightSelections()
    if (selectedOption === 'selection') {
      highlightTextSelection()
      addHighlightListener()
      return
    }
    if (selectedOption === 'article') {
      // find article in document
      const article = document.querySelector('article')
      if (!article) {
        // find main in document
        const main = document.querySelector('main')
        addHighlightBorder(main)
      }
      addHighlightBorder(article)
      return
    }
    if (selectedOption === 'full-page') {
      const body = document.querySelector('body')
      addHighlightBorder(body)
    }
  }, [selectedOption])

  useEffect(() => {
    const existingElement = document.getElementById('plasmo-google-sidebar')
    if (existingElement) {
      existingElement.style.display = isOpen ? 'block' : 'none'
    }
    if (!isOpen) {
      removeHighlightListener()
      removeHighlightSelections()
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
function addHighlightBorder(main: HTMLElement | null) {
  if (main) {
    currentNodeSelected = main
    main.classList.add('buddy-beep-highlight-border')
  }
}
