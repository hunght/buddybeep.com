import Browser from 'webextension-polyfill'
import { ALL_IN_ONE_PAGE_ID } from '~app/consts'
import { getUserConfig } from '~services/user-config'
import { trackInstallSource } from './source'
import { readTwitterCsrfToken } from './twitter-cookie'
import contentTest from './contentTest?script'
import logger from '~utils/logger'
import { SidePanelMessageType } from '~app/types/sidePanel'
import supabase, { getUserId } from '~lib/supabase/client'

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
      const userId = await getUserId()
      if (userId) {
        const { data: note } = await supabase
          .from('notes')
          .insert({
            title: message.content,
            user_id: userId,
            source_url: message.link,
          })
          .select('id')
          .single()
        if (note?.id) {
          composeMessage.noteId = note?.id
        }
      }
      Browser.storage.local.set({ sidePanelSummaryAtom: composeMessage })
      break
    }
  }
})

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
  if (command === 'open-app') {
    logger.debug(`Command: ${command}`)
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
    const userId = await getUserId()
    if (userId) {
      const id = await saveNoteAndProcessSummary(message, userId)
      return { noteId: id }
    }
  }
  if (message.action === 'saveContent') {
    const userId = await getUserId()
    if (userId) {
      const id = await saveNote(message, userId)
      return { noteId: id }
    }
  }
  if (message.action === 'createAnwserNote') {
    const userId = await getUserId()

    console.log('message', message)
    console.log('userId', userId)

    const note: {
      content: string
      title: string | null
      type: string | null
      parent_id: string
    } = message.note

    if (userId) {
      if (note.type === 'summary-youtube-videos' || note.type === 'explain-a-concept') {
        // update current parent note content
        await supabase
          .from('notes')
          .update({
            content: note.content,
          })
          .eq('id', note.parent_id)
      } else {
        await supabase.from('notes').insert({
          title: `Explain ${note.title}`,
          content: note.content,
          user_id: userId,
          parent_id: note.parent_id,
        })
      }
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
  const prompt = `Get key points from content: Title:${message.title},Link:${message.link} content:${message.content}`
  const noteId = await saveNote(message, userId)
  Browser.storage.local.set({ sidePanelSummaryAtom: { ...message, noteId: noteId, content: prompt } })
  return noteId
}

async function saveNote(message: any, userId: string) {
  const { data: note } = await supabase
    .from('notes')
    .insert({
      title: message.title,
      content: message.content,
      user_id: userId,
      source_url: message.link,
      description: message.description,
      type: message.type,
    })
    .select('id')
    .single()
  console.log('note', note, message.type)
  return note?.id
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
