import { createRoot } from 'react-dom/client'

import './i18n'
import SidePanelPage from './pages/SidePanelPage'
import { trackEvent } from './plausible'
import './base.scss'
import './sidepanel.css'
import { Provider } from 'jotai'
import { myAtomStore } from './state/store'
import { sidePanelSummaryAtom } from './state/sidePanelAtom'

function SidePanelApp() {
  return <SidePanelPage />
}

const container = document.getElementById('app')!
const root = createRoot(container)
root.render(
  <Provider store={myAtomStore}>
    <SidePanelApp />
  </Provider>,
)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openSidePanel') {
    console.log(`==== request ===`)
    console.log(request)
    console.log('==== end log ===')

    myAtomStore.set(sidePanelSummaryAtom, { content: request.content, link: request.link, title: request.title })
  }
})
