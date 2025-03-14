import { useEffect, useState } from 'react'

// Inject to the webpage itself
import './google-sidebar-base.css'

import { getDocumentDescription, getDocumentTextFromDOM } from '~content-script/helper/dom'
import { useTranslation } from 'react-i18next'
import logger from '~utils/logger'
import LoadingOverlay from './loading-overlay'
import { useSuccessPopup } from '~/hooks/useSuccessPopup'

// Debounce function with TypeScript type annotations
function debounce<F extends (...args: any[]) => any>(func: F, wait: number): F {
  let timeoutId: number | null = null
  return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    clearTimeout(timeoutId!)
    timeoutId = window.setTimeout(() => func.apply(this, args), wait) as unknown as number
  } as F
}

interface TooltipProps {
  children: React.ReactNode
  text: string
}

const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <div onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
        {children}
      </div>
      {isVisible && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            maxWidth: '200px', // Set a max-width
            width: 'max-content', // Ensure it's not always at max-width
            wordWrap: 'break-word', // Allow long words to break
            whiteSpace: 'normal', // Allow text to wrap
            textAlign: 'center', // Center the text
            zIndex: 1000,
          }}
        >
          {text}
        </div>
      )}
    </div>
  )
}

const GoogleSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [currentNode, setCurrentNode] = useState<HTMLElement | null>(null)
  const [currentNodeSelected, setCurrentNodeSelected] = useState<HTMLElement | null>(null)
  const { t } = useTranslation()
  const isPrintLayout = document.body.id === 'print-layout'
  const [selectedOption, setSelectedOption] = useState('article')
  const { setShowSuccess } = useSuccessPopup()
  const [buttonsDisabled, setButtonsDisabled] = useState(false)

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
  const content = getDocumentTextFromDOM(currentNodeSelected)
  if (isPrintLayout) {
    return <div />
  }
  const onClickSave = async () => {
    const data = await chrome.runtime.sendMessage({
      action: 'saveContent',
      content,
      link: window.location.href,
      title: document.title,
      description: getDocumentDescription(),
    })

    setIsOpen(false)

    setShowSuccess(data?.noteId ?? '')
  }
  const onClickSaveAndAsk = async () => {
    if (buttonsDisabled) return
    try {
      setButtonsDisabled(true)
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

      setIsOpen(false)
      setLoading(false)
      setShowSuccess(data?.noteId ?? '')
    } catch (error) {
      logger.error(error)
    } finally {
      setLoading(false)
      setButtonsDisabled(false)
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
      className="z-[9999] relative bg-red-500"
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
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '8px',
                marginTop: '12px',
                marginBottom: '8px',
              }}
            >
              <Tooltip text={chrome.i18n.getMessage('saveTooltip') || 'Save the selected content to your notes'}>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px 8px',
                    backgroundColor: '#4F46E5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: buttonsDisabled ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                    opacity: buttonsDisabled ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!buttonsDisabled) {
                      e.currentTarget.style.backgroundColor = '#4338CA'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!buttonsDisabled) {
                      e.currentTarget.style.backgroundColor = '#4F46E5'
                    }
                  }}
                  onClick={onClickSave}
                  disabled={buttonsDisabled}
                >
                  {chrome.i18n.getMessage('save')}
                </button>
              </Tooltip>

              <Tooltip
                text={chrome.i18n.getMessage('askTooltip') || 'Save the content and open AI chat to ask questions'}
              >
                <button
                  style={{
                    width: '100px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px 8px',
                    backgroundColor: 'white',
                    color: '#4F46E5',
                    border: '1px solid #4F46E5',
                    borderRadius: '4px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: buttonsDisabled ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s, color 0.2s',
                    opacity: buttonsDisabled ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!buttonsDisabled) {
                      e.currentTarget.style.backgroundColor = '#EEF2FF'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!buttonsDisabled) {
                      e.currentTarget.style.backgroundColor = 'white'
                    }
                  }}
                  onClick={onClickSaveAndAsk}
                  disabled={buttonsDisabled}
                >
                  {chrome.i18n.getMessage('ask')}
                </button>
              </Tooltip>
            </div>
            <ul>
              <Tooltip text="Choose a section using + and -">
                <li
                  className={` ${selectedOption === 'article' ? 'selected' : ''}`}
                  onClick={() => {
                    handleSelectOption('article')
                  }}
                >
                  Article
                </li>
              </Tooltip>
              <Tooltip text="Freely choose a part on the page">
                <li
                  className={selectedOption === 'selection' ? 'selected' : ''}
                  onClick={() => {
                    handleSelectOption('selection')
                  }}
                >
                  Selection
                </li>
              </Tooltip>
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
