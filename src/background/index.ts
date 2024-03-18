import Browser from 'webextension-polyfill'
import { ALL_IN_ONE_PAGE_ID } from '~app/consts'
import { getUserConfig } from '~services/user-config'
import { trackInstallSource } from './source'
import { readTwitterCsrfToken } from './twitter-cookie'
import { myAtomStore } from '~app/state/store'
import { sidePanelSummaryAtom } from '~app/state/sidePanelAtom'

// expose storage.session to content scripts
// using `chrome.*` API because `setAccessLevel` is not supported by `Browser.*` API
chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' })

async function openAppPage() {
  const tabs = await Browser.tabs.query({})
  const url = Browser.runtime.getURL('app.html')
  const tab = tabs.find((tab) => tab.url?.startsWith(url))
  if (tab) {
    await Browser.tabs.update(tab.id, { active: true })
    return
  }
  const { startupPage } = await getUserConfig()
  const hash = startupPage === ALL_IN_ONE_PAGE_ID ? '' : `#/chat/${startupPage}`
  await Browser.tabs.create({ url: `app.html${hash}` })
}

Browser.action.onClicked.addListener(() => {
  openAppPage()
})

Browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    Browser.tabs.create({ url: 'app.html#/setting' })
    trackInstallSource()
  }
})

Browser.commands.onCommand.addListener(async (command) => {
  console.debug(`Command: ${command}`)
  if (command === 'open-app') {
    openAppPage()
  }
})

Browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.debug('onMessage', message, sender)

  if (message.action === 'openSidePanel') {
    const tabId = sender.tab?.id
    if (tabId) {
      chrome.sidePanel.open({ tabId })
      myAtomStore.set(sidePanelSummaryAtom, message)
      Browser.storage.local.set({ sidePanelSummaryAtom: message })
    }
  }
  if (message.action === 'openMainApp') {
    openAppPage()
  }
  if (message.target !== 'background') {
    return
  }
  if (message.type === 'read-twitter-csrf-token') {
    return readTwitterCsrfToken(message.data)
  }
})
