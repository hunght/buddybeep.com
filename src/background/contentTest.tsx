import React from 'react'

import { createRoot } from 'react-dom/client'

import injectedStyle from './summary-component/google-sidebar.css?inline'
import GoogleSidebar from './summary-component/google-sidebar'

function mount() {
  // Remove the existing element if it exists

  const existingElement = document.getElementById('plasmo-google-sidebar')
  if (existingElement) {
    existingElement.remove()
  }
  console.log(`==== existingElement ===`)
  console.log(existingElement)
  console.log('==== end log ===')

  // // Listen for a selection change event in the document
  // document.addEventListener('mouseup', function () {
  //   const selection = window.getSelection()

  //   if (!selection) {
  //     return
  //   }
  //   // Check if there is any text selected
  //   if (selection.toString().trim() !== '') {
  //     // Get the selected range
  //     const range = selection.getRangeAt(0)

  //     // Check if the range is within an element
  //     if (range && range.commonAncestorContainer) {
  //       const commonAncestorContainer = range.commonAncestorContainer

  //       // Make sure the selectedElement is of type Element
  //       const selectedElement =
  //         commonAncestorContainer.nodeType === 3 ? commonAncestorContainer.parentNode : range.commonAncestorContainer

  //       // Highlight the element by adding a red border
  //       selectedElement?.classList.add('highlight-border')
  //     }
  //   }
  // })
  // // To remove the highlight, you can define another event listener as mentioned
  // document.addEventListener('mousedown', function () {
  //   // Find all elements with the 'highlight-border' class
  //   const highlightedElements = document.querySelectorAll('.highlight-border')

  //   // Remove the class from all such elements
  //   highlightedElements.forEach(function (element) {
  //     element.classList.remove('highlight-border')
  //   })
  // })
  const root = document.createElement('div')
  root.id = 'plasmo-google-sidebar'

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
    document.getElementById('plasmo-google-sidebar')?.remove()
    mount()
    console.log(`==== msg 1===`)
    console.log(msg)
    console.log('==== end log ===')

    return response({ type: 'mounted' })
  }
})
