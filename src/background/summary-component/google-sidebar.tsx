import { useEffect, useState } from 'react'

// Inject to the webpage itself
import './google-sidebar-base.css'

import { getDocumentDescription, getDocumentTextFromDOM } from '~content-script/helper/dom'
import { useTranslation } from 'react-i18next'
import logger from '~utils/logger'
import LoadingOverlay from './loading-overlay'
// Debounce function with TypeScript type annotations
function debounce<F extends (...args: any[]) => any>(func: F, wait: number): F {
  let timeoutId: number | null = null
  return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    clearTimeout(timeoutId!)
    timeoutId = window.setTimeout(() => func.apply(this, args), wait) as unknown as number
  } as F
}

const GoogleSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [currentNode, setCurrentNode] = useState<HTMLElement | null>(null)
  const [currentNodeSelected, setCurrentNodeSelected] = useState<HTMLElement | null>(null)
  const { t } = useTranslation()
  const isPrintLayout = document.body.id === 'print-layout'
  const [selectedOption, setSelectedOption] = useState('article')
  const [showSuccess, setShowSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (showSuccess) {
      const popup = document.createElement('div')
      popup.innerText = 'Note created successfully! Click to view.'
      popup.style.position = 'fixed'
      popup.style.top = '20px'
      popup.style.right = '20px'
      popup.style.transform = 'translate(-50%, -50%)'
      popup.style.backgroundColor = '#872DD3'
      popup.style.color = 'white'
      popup.style.padding = '10px'
      popup.style.borderRadius = '5px'
      popup.style.zIndex = '9999'
      popup.style.cursor = 'pointer'
      popup.onclick = () => {
        //Open the note in seperate tab
        window.open(`https://www.buddybeep.com/dashboard/${showSuccess}`, '_blank')
      }
      document.body.appendChild(popup)

      setTimeout(() => {
        document.body.removeChild(popup)
      }, 10000)
    }
  }, [showSuccess])

  useEffect(() => {
    function highlightTextSelection(event: { target: any }) {
      const selection = window.getSelection()
      if (!selection || selection.toString().trim() === '') {
        const hoveredElement = event.target
        if (hoveredElement) {
          setCurrentNodeSelected(hoveredElement)
        }
        return
      }

      const range = selection.getRangeAt(0)
      if (range && range.commonAncestorContainer) {
        const commonAncestorContainer = range.commonAncestorContainer
        const selectedElement =
          commonAncestorContainer.nodeType === 3 ? commonAncestorContainer.parentNode : range.commonAncestorContainer

        setCurrentNodeSelected(selectedElement)
      }
    }
    document.addEventListener('mouseup', highlightTextSelection)
    return () => {
      document.removeEventListener('mouseup', highlightTextSelection)
    }
  }, [])
  useEffect(() => {
    const preventClick = (event: MouseEvent): void => {
      if (event.target !== document.getElementById('buddy-beep-google-sidebar')) {
        event.preventDefault()
        event.stopPropagation()
        console.log('Clicked but prevented!')
      }
    }

    // Adding event listener during component mount
    document.addEventListener('click', preventClick)

    // Cleanup listener when component unmounts
    return () => {
      document.removeEventListener('click', preventClick)
    }
  }, [])
  useEffect(() => {
    // Inject into the ShadowDOM
    const highlightOverSelection = (event: { target: any }) => {
      const hoveredElement = event.target
      if (hoveredElement) {
        setCurrentNode(hoveredElement)
      }
    }
    const debounceHighlightOverSelection = debounce(highlightOverSelection, 300)

    document.removeEventListener('mouseover', debounceHighlightOverSelection)
    if (selectedOption !== 'selection') {
      return
    }

    document.addEventListener('mouseover', debounceHighlightOverSelection)
    return () => {
      document.removeEventListener('mouseover', debounceHighlightOverSelection)
    }
  }, [selectedOption])

  useEffect(() => {
    if (!currentNode) {
      return
    }

    const shadowHost = document.getElementById('buddy-beep-google-sidebar')?.shadowRoot

    const overlay = shadowHost?.getElementById('buddy-beep-overlay-hole') ?? null
    updateOverlay()
    window.addEventListener('resize', updateOverlay) // Update on resize
    window.addEventListener('scroll', updateOverlay) // Update on scroll

    function updateOverlay() {
      if (!overlay || !currentNode) {
        return
      }

      const rect = currentNode.getBoundingClientRect()

      overlay.style.top = `${rect.top}px`
      overlay.style.left = `${rect.left}px`
      overlay.style.width = `${rect.width}px`
      overlay.style.height = `${rect.height}px`
    }
    return () => {
      window.removeEventListener('resize', updateOverlay)
      window.removeEventListener('scroll', updateOverlay)
    }
  }, [currentNode, selectedOption])

  useEffect(() => {
    if (!currentNodeSelected) {
      return
    }

    const shadowHost = document.getElementById('buddy-beep-google-sidebar')?.shadowRoot

    const overlay = shadowHost?.getElementById('buddy-beep-overlay-hole-selected') ?? null
    updateOverlay()
    window.addEventListener('resize', updateOverlay) // Update on resize
    window.addEventListener('scroll', updateOverlay) // Update on scroll

    function updateOverlay() {
      if (!overlay || !currentNodeSelected) {
        return
      }

      const rect = currentNodeSelected.getBoundingClientRect()

      overlay.style.top = `${rect.top}px`
      overlay.style.left = `${rect.left}px`
      overlay.style.width = `${rect.width}px`
      overlay.style.height = `${rect.height}px`
    }
    return () => {
      window.removeEventListener('resize', updateOverlay)
      window.removeEventListener('scroll', updateOverlay)
    }
  }, [currentNodeSelected, selectedOption])

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
      if (article) {
        setCurrentNodeSelected(article)
        return
      }
      // find main in document
      const main = document.querySelector('main')
      if (main) {
        setCurrentNodeSelected(main)
        return
      }
      const body = document.querySelector('body')
      setCurrentNodeSelected(body)
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
  }, [isOpen])

  if (isPrintLayout) {
    return <div />
  }

  const onClickSaveAndAsk = async () => {
    try {
      setLoading(true)
      const content = getDocumentTextFromDOM(currentNodeSelected)

      const data = await chrome.runtime.sendMessage({
        action: 'openSidePanel',
        content,
        link: window.location.href,
        title: document.title,
        type: 'summary-web-content',
        description: getDocumentDescription(),
      })
      console.log(`==== data ===`)
      console.log(data)
      console.log('==== end log ===')

      setIsOpen(false)
      setLoading(false)
      setShowSuccess(data?.noteId ?? '')
    } catch (error) {
      logger.error(error)
    } finally {
      setLoading(false)
    }
  }
  const onClickExpandElement = () => {
    //find parent note of current node
    const parent = currentNodeSelected?.parentElement

    if (parent) {
      setCurrentNodeSelected(parent)
    }
  }
  const onClickCollapseElement = (event) => {
    //find first child note of current node
    const child = currentNodeSelected?.children[0]

    if (child) {
      setCurrentNodeSelected(child)
    }
  }
  const handleMouseUpButton = (event) => {
    event.stopPropagation()
  }
  return (
    <div
      onMouseUp={handleMouseUpButton} // Stop propagation
      className="z-50 relative bg-red-500"
    >
      <div className="flex absolute top-0 left-0">
        <div id="buddy-beep-overlay-container">
          {currentNodeSelected && (
            <div id="buddy-beep-overlay">
              {selectedOption === 'selection' && <div id="buddy-beep-overlay-hole"></div>}
              <div id="buddy-beep-overlay-hole-selected">
                {selectedOption === 'article' && (
                  <div className="w-10 mx-auto pointer-events-auto flex justify-between">
                    <button
                      className="w-5 h-5 bg-gray-500 font-bold text-white text-center  cursor-pointer"
                      onClick={onClickExpandElement}
                    >
                      +
                    </button>
                    <button
                      className="w-5 h-5 bg-gray-500 font-bold text-white text-center p-0  cursor-pointer"
                      onClick={onClickCollapseElement}
                    >
                      -
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div id="sidebar">
          <div className="sidebar-toggle text-xl">
            <span
              className="text-white font-bold cursor-pointer transition-colors duration-300 bg-opacity-50 absolute right-0 top-0 mr-1 rounded-full w-15 h-15 items-center content-center text-center text-12"
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
              className="bg-indigo-500 flex items-center justify-center  rounded-full shadow-md cursor-pointer text-white py-2 px-1 text-lg gap-1.5"
              onClick={onClickSaveAndAsk}
            >
              {chrome.i18n.getMessage('save_and_ask')}
            </div>

            <ul>
              <li
                className={` ${selectedOption === 'article' ? 'selected' : ''}`}
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
            {selectedOption === 'selection' && !currentNodeSelected && (
              <p style={{ fontSize: 13, color: 'red' }}>Hover and click to make selection.</p>
            )}
            <LoadingOverlay loading={loading} />
          </div>
        </div>
      </div>
    </div>
  )
}
export default GoogleSidebar
