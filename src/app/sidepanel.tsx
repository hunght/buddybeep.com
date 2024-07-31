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

Browser.storage.local.onChanged.addListener((changes) => {
  if (changes.sidePanelSummaryAtom) {
    console.log('changes.sidePanelSummaryAtom.newValue', changes.sidePanelSummaryAtom.newValue)
    myAtomStore.set(sidePanelSummaryAtom, changes.sidePanelSummaryAtom.newValue)
  }
})
