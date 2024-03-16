import { useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { useTranslation } from 'react-i18next'
import Browser from 'webextension-polyfill'
import premiumIcon from '~/assets/icons/premium.svg'
import Button from './components/Button'
import { usePremium } from './hooks/use-premium'
import './i18n'
import SidePanelPage from './pages/SidePanelPage'
import { trackEvent } from './plausible'
import './base.scss'
import './sidepanel.css'

function SidePanelApp() {
  return <SidePanelPage />
}

const container = document.getElementById('app')!
const root = createRoot(container)
root.render(<SidePanelApp />)
let port

// Listen for incoming connections
chrome.runtime.onConnect.addListener((connectedPort) => {
  if (connectedPort.name === 'contentScriptToSidePanel') {
    port = connectedPort

    // Listen for messages from the content script
    port.onMessage.addListener((data) => {
      // Handle the received data here
      console.log('Received data from content script:', data)
      // Update the side panel UI or perform other operations with the data
    })
  }
})
