import React from 'react'

import { createRoot } from 'react-dom/client'

import injectedStyle from './style.css?inline'
import { ContentScript } from './contentScript'
import { waitForElm } from './helper/transcipt'
import { Provider } from 'jotai'
import { myAtomStore } from '~app/state/store'
import { youtubeVideoDataAtom } from '~app/state/youtubeAtom'
import { getSearchParam } from './helper/searchParam'
import './base.css'
import logger from '~utils/logger'
const root = document.createElement('div')
root.id = 'plasmo-inline-example-unique-id'

const shadowRoot = root.attachShadow({ mode: 'open' })

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
    createRoot(shadowRoot).render(
      <Provider store={myAtomStore}>
        <ContentScript />
      </Provider>,
    )
  })
  .catch((error) => {
    logger.error('[#secondary.style-scope.ytd-watch-flexy]', error)
  })
  .finally(() => {})

let currentUrl = window.location.href
const url = getSearchParam(currentUrl).v
const title = document.title
myAtomStore.set(youtubeVideoDataAtom, { url, title: title })
const observer = new MutationObserver((mutations) => {
  // Check if the URL has changed
  const newUrl = window.location.href
  if (newUrl !== currentUrl) {
    const url = getSearchParam(newUrl).v
    const title = document.title

    myAtomStore.set(youtubeVideoDataAtom, { url, title: title })
    currentUrl = newUrl
  }
})

// Start observing the document body for changes
observer.observe(document.body, {
  childList: true,
  subtree: true,
})
