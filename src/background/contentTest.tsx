import React from 'react'

import { createRoot } from 'react-dom/client'

import injectedStyle from './summary-component/google-sidebar.css?inline'
import GoogleSidebar from './summary-component/google-sidebar'

function mount() {
  // Remove the existing element if it exists

  const existingElement = document.getElementById('buddy-beep-google-sidebar')
  if (existingElement) {
    existingElement.remove()
  }

  const root = document.createElement('div')
  root.id = 'buddy-beep-google-sidebar'

  document.body.append(root)

  const rootIntoShadow = document.createElement('div')
  rootIntoShadow.id = 'shadow-root'

  const shadowRoot = root.attachShadow({ mode: 'open' })
  shadowRoot.appendChild(rootIntoShadow)

  /** Inject styles into shadow dom */
  const styleElement = document.createElement('style')
  styleElement.innerHTML = injectedStyle
  shadowRoot.appendChild(styleElement)

  /**
   * https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite/pull/174
   *
   * In the firefox environment, the adoptedStyleSheets bug may prevent contentStyle from being applied properly.
   * Please refer to the PR link above and go back to the contentStyle.css implementation, or raise a PR if you have a better way to improve it.
   */
  createRoot(rootIntoShadow).render(<GoogleSidebar />)
}

mount()

// re-mount the app on each message
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  if (msg.type === 'mountApp') {
    document.getElementById('buddy-beep-google-sidebar')?.remove()
    mount()

    return response({ type: 'mounted' })
  }
})
