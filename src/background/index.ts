import Browser from 'webextension-polyfill'
import { ALL_IN_ONE_PAGE_ID } from '~app/consts'
import { getUserConfig } from '~services/user-config'
import { trackInstallSource } from './source'
import { readTwitterCsrfToken } from './twitter-cookie'
import contentTest from './contentTest?script'
import logger from '~utils/logger'
import { SidePanelMessageType } from '~app/types/sidePanel'
import supabase from '~lib/supabase/client'

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

Browser.action.onClicked.addListener(async (tab) => {
  openSidePanel()
  // openAppPage()
  executeContentScript(tab)
})

function executeContentScript(tab: Browser.Tabs.Tab) {
  if (tab.url && !tab.url.includes('chrome://')) {
    if (!tab.id) {
      return
    }
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [contentTest],
    })
    chrome.tabs.sendMessage(tab.id, { type: 'mountApp' })
  }
}
Browser.contextMenus.onClicked.addListener(async (info, tab) => {
  const message = {
    content: info.selectionText ?? '',
    link: info.pageUrl ?? '',
    title: '',
  }

  switch (info.menuItemId) {
    case 'composeThis': {
      // Handle the "Compose this" action
      console.log('Composing: ' + info.selectionText)
      await chrome.sidePanel.open({ tabId: tab?.id })
      const composeMessage: SidePanelMessageType = { ...message, subType: 'compose', type: 'writing-assistant' }

      Browser.storage.local.set({ sidePanelSummaryAtom: composeMessage })
      break
    }
    case 'replyToThis': {
      // Handle the "Reply to this" action
      await chrome.sidePanel.open({ tabId: tab?.id })
      const composeMessage: SidePanelMessageType = { ...message, subType: 'reply', type: 'writing-assistant' }

      Browser.storage.local.set({ sidePanelSummaryAtom: composeMessage })

      break
    }
    case 'explainThis': {
      // Handle the "Explain this" action
      await chrome.sidePanel.open({ tabId: tab?.id })

      const composeMessage: SidePanelMessageType = { ...message, subType: null, type: 'explain-a-concept' }

      Browser.storage.local.set({ sidePanelSummaryAtom: composeMessage })
      break
    }
  }
})

function launchWebAuthFlow(url: string, interactive: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow({ url, interactive }, async (redirectedTo) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve(redirectedTo)
      }
    })
  })
}

Browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    Browser.tabs.create({ url: 'app.html#' })
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
    openSidePanel()
    chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
      executeContentScript(tab)
    })
  }
})

Browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  logger.debug('onMessage', message, sender)

  if (message.action === 'openSidePanel') {
    const tabId = sender.tab?.id
    await openSidePanelWithTabId(tabId)
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session) {
      const userId = session.user.id

      await saveNoteAndProcessSummary(message, userId)
      return
    }
    const manifest = chrome.runtime.getManifest()

    const url = new URL('https://accounts.google.com/o/oauth2/auth')

    url.searchParams.set('client_id', manifest.oauth2.client_id)
    url.searchParams.set('response_type', 'id_token')
    url.searchParams.set('access_type', 'offline')
    const redirectURI = `https://${chrome.runtime.id}.chromiumapp.org`
    url.searchParams.set('redirect_uri', redirectURI)
    url.searchParams.set('scope', manifest.oauth2.scopes.join(' '))
    console.log(`==== redirectURI ===`)
    console.log(redirectURI)
    console.log(manifest.oauth2.client_id)
    console.log('==== end log ===')

    try {
      const redirectedTo = await launchWebAuthFlow(url.toString(), true)
      console.log(`==== redirectedTo ===`)
      console.log(redirectedTo)
      console.log('==== end log ===')

      // auth was successful, extract the ID token from the redirectedTo URL
      if (!redirectedTo) {
        return
      }
      const redirectedUrl = new URL(redirectedTo)

      const params = new URLSearchParams(redirectedUrl.hash.replace('#', ''))
      const idToken = params.get('id_token')
      if (!idToken) {
        return
      }
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      })
      if (error) {
        console.error('Error logging in:', error.message)
      } else {
        await saveNoteAndProcessSummary(message, data.user.id)
      }
    } catch (error) {
      console.error('Error logging in:', error)
    }
  }

  if (message.action === 'openSidePanelOnly') {
    const tabId = sender.tab?.id
    if (tabId) {
      chrome.tabs.remove(tabId)
    }

    await openSidePanelWithTabId(tabId)
  }

  if (message.action === 'openMainApp') {
    openAppPage({ agentId: message.agentId, botId: message.botId })
    await chrome.sidePanel.setOptions({
      path: 'sidepanel.html',
      enabled: false,
    })
  }
  if (message.target !== 'background') {
    return
  }
  if (message.type === 'read-twitter-csrf-token') {
    return readTwitterCsrfToken(message.data)
  }
})

async function saveNoteAndProcessSummary(message: any, userId: string) {
  const prompt = `Get key points from web:Title:${message.title},Link:${message.link} content:${message.content}`
  const { data: note } = await supabase
    .from('notes')
    .insert({ title: message.title, content: message.content, user_id: userId })
    .select('id')
    .single()

  Browser.storage.local.set({ sidePanelSummaryAtom: { ...message, noteId: note?.id, content: prompt } })
}

async function openSidePanelWithTabId(tabId: number | undefined) {
  if (tabId) {
    chrome.sidePanel.setOptions({
      path: 'sidepanel.html',
      enabled: true,
    })
    await chrome.sidePanel.open({ tabId })
    await chrome.sidePanel.setOptions({
      path: 'sidepanel.html',
      enabled: true,
    })
  }
}

function openSidePanel() {
  chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
    chrome.sidePanel.setOptions({
      path: 'sidepanel.html',
      enabled: true,
    })
    await chrome.sidePanel.open({ tabId: tab.id })
    await chrome.sidePanel.setOptions({
      path: 'sidepanel.html',
      enabled: true,
    })
  })
}
