import React from 'react'

import { createRoot } from 'react-dom/client'

import injectedStyle from './style.css?inline'
import { ContentScript } from './contentScript'
import { waitForElm } from './helper/transcipt'

const root = document.createElement('div')
root.id = 'plasmo-inline-example-unique-id'

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

waitForElm('#secondary.style-scope.ytd-watch-flexy')
  .then((element) => {
    element?.insertAdjacentElement('afterbegin', root)
    createRoot(rootIntoShadow).render(<ContentScript />)
  })
  .catch((error) => {
    console.error('Error fetching data:', error)
  })
  .finally(() => {
    console.log('finally')
  })
