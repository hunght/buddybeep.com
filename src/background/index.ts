import Browser from 'webextension-polyfill'
import { ALL_IN_ONE_PAGE_ID } from '~app/consts'
import { getUserConfig } from '~services/user-config'
import { trackInstallSource } from './source'
import { readTwitterCsrfToken } from './twitter-cookie'

import logger from '~utils/logger'
import { SidePanelMessageType } from '~app/types/sidePanel'

// expose storage.session to content scripts
// using `chrome.*` API because `setAccessLevel` is not supported by `Browser.*` API
chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' })

async function openAppPage({ agentId, botId }: { agentId?: string; botId?: string } = {}) {
  const tabs = await Browser.tabs.query({})
  const url = Browser.runtime.getURL('app.html') + (agentId ? `#/chat-agent/${agentId}/${botId}` : '')
  const tab = tabs.find((tab) => tab.url?.startsWith(url))
  if (tab) {
    await Browser.tabs.update(tab.id, { active: true })
    return
  }
  if (agentId && botId) {
    await Browser.tabs.create({ url })
    return
  }
  const { startupPage } = await getUserConfig()
  const hash = startupPage === ALL_IN_ONE_PAGE_ID ? '' : `#/chat/${startupPage}`
  await Browser.tabs.create({ url: `app.html${hash}` })
}

Browser.action.onClicked.addListener(() => {
  openAppPage()
})

Browser.contextMenus.onClicked.addListener(function (info, tab) {
  const message = {
    content: info.selectionText ?? '',
    link: info.pageUrl ?? '',
    title: '',
  }

  switch (info.menuItemId) {
    case 'composeThis': {
      // Handle the "Compose this" action
      console.log('Composing: ' + info.selectionText)
      chrome.sidePanel.open({ tabId: tab?.id })
      const composeMessage: SidePanelMessageType = { ...message, subType: 'compose', type: 'writing-assistant' }

      Browser.storage.local.set({ sidePanelSummaryAtom: composeMessage })
      break
    }
    case 'replyToThis': {
      // Handle the "Reply to this" action
      chrome.sidePanel.open({ tabId: tab?.id })
      const composeMessage: SidePanelMessageType = { ...message, subType: 'reply', type: 'writing-assistant' }

      Browser.storage.local.set({ sidePanelSummaryAtom: composeMessage })

      break
    }
    case 'explainThis': {
      // Handle the "Explain this" action
      chrome.sidePanel.open({ tabId: tab?.id })

      const composeMessage: SidePanelMessageType = { ...message, subType: 'reply', type: 'explain-a-concept' }

      Browser.storage.local.set({ sidePanelSummaryAtom: composeMessage })
      break
    }
  }
})
Browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    Browser.tabs.create({ url: 'app.html#/setting' })
    trackInstallSource()
  }
  chrome.contextMenus.create({
    id: 'buddyBeep',
    title: 'BuddyBeep',
    contexts: ['selection'],
  })

  // Submenu: Compose this
  chrome.contextMenus.create({
    id: 'composeThis',
    parentId: 'buddyBeep',
    title: 'Compose this',
    contexts: ['selection'],
  })

  // Submenu: Reply to this
  chrome.contextMenus.create({
    id: 'replyToThis',
    parentId: 'buddyBeep',
    title: 'Reply to this',
    contexts: ['selection'],
  })

  // Submenu: Explain this
  chrome.contextMenus.create({
    id: 'explainThis',
    parentId: 'buddyBeep',
    title: 'Explain this',
    contexts: ['selection'],
  })
})

Browser.commands.onCommand.addListener(async (command) => {
  logger.debug(`Command: ${command}`)
  if (command === 'open-app') {
    openAppPage()
  }
})

Browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  logger.debug('onMessage', message, sender)

  if (message.action === 'openSidePanel') {
    const tabId = sender.tab?.id
    if (tabId) {
      chrome.sidePanel.open({ tabId })

      Browser.storage.local.set({ sidePanelSummaryAtom: message })
    }
  }
  if (message.action === 'openMainApp') {
    openAppPage({ agentId: message.agentId, botId: message.botId })
  }
  if (message.target !== 'background') {
    return
  }
  if (message.type === 'read-twitter-csrf-token') {
    return readTwitterCsrfToken(message.data)
  }
})
