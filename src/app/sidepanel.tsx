import { createRoot } from 'react-dom/client'

import './i18n'
import SidePanelPage from './pages/SidePanelPage'

import './base.scss'
import './sidepanel.css'
import { Provider } from 'jotai'
import { myAtomStore } from './state/store'
import { sidePanelSummaryAtom } from './state/sidePanelAtom'
import Browser from 'webextension-polyfill'

const container = document.getElementById('app')!
const root = createRoot(container)
root.render(
  <Provider store={myAtomStore}>
    <SidePanelPage />
  </Provider>,
)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openSidePanel') {
    myAtomStore.set(sidePanelSummaryAtom, {
      content: request.content,
      link: request.link,
      title: request.title,
      type: request.type,
      subType: request.subType,
    })
  }
})
Browser.storage.local.onChanged.addListener((changes) => {
  if (changes.sidePanelSummaryAtom) {
    myAtomStore.set(sidePanelSummaryAtom, changes.sidePanelSummaryAtom.newValue)
  }
})
