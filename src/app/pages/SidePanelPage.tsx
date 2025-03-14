import { useAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cx } from '~/utils'
import Button from '~app/components/Button'
import ChatMessageInput from '~app/components/Chat/ChatMessageInput'
import ChatMessageList from '~app/components/Chat/ChatMessageList'
import ChatbotName from '~app/components/Chat/ChatbotName'
import { CHATBOTS } from '~app/consts'
import { ConversationContext, ConversationContextValue } from '~app/context'
import { useChat } from '~app/hooks/use-chat'
import { sidePanelBotAtom, sidePanelSummaryAtom } from '~app/state/sidePanelAtom'

import logo from '~/assets/logo-48.png'
import guildeWebContent from '~/assets/screen/guilde-web-content.png'

import { WritingPresetModal } from '~app/components/write-reply/modal'
import { PrimaryButton } from '~app/components/PrimaryButton'
import { buildPromptWithLang } from '~app/utils/lang'
import {
  composeTextAtom,
  formatAtom,
  originalTextAtom,
  replyContentAtom,
  subTabAtom,
} from '~app/state/writingAssistantAtom'
import Dialog from '~app/components/Dialog'

import MenuDropDown from '~app/components/side-panel/MenuDropDown'

import { getLinkFromSummaryObject } from '~app/utils/summary'
import Browser from 'webextension-polyfill'
import { generatePromptFromPostData } from '~app/utils/promptGenerator'
import { atomWithStorage } from 'jotai/utils'

const bingPingSentAtom = atomWithStorage('bingPingSent', false)

function SidePanelPage() {
  const [tab, setTab] = useState<'chat' | 'write'>('chat')
  const { t } = useTranslation()
  const [botId, setBotId] = useAtom(sidePanelBotAtom)
  const [summaryText, setSummaryText] = useAtom(sidePanelSummaryAtom)
  const [openWritingPreset, setOpenWritingPreset] = useState(false)
  const [openSummaryModal, setOpenSummaryModal] = useState(false)
  const [, setOriginalTextAtom] = useAtom(originalTextAtom)
  const [, setComposeTextAtom] = useAtom(composeTextAtom)
  const [, setReplyContentAtom] = useAtom(replyContentAtom)
  const [, setFormatAtom] = useAtom(formatAtom)

  const [, setSubTab] = useAtom(subTabAtom)
  const botInfo = CHATBOTS[botId]
  const agentType = summaryText?.type
  const agentId = useMemo(() => {
    if (tab === 'write') {
      return 'writing-assistant'
    }
    if (tab === 'chat') {
      if (agentType === 'writing-assistant') {
        return null
      }
    }
    return agentType ?? null
  }, [agentType, tab])

  useEffect(() => {
    if (summaryText) {
      return
    }
    const loadSummaryTextFromLocalStorage = async () => {
      try {
        const storedSummaryText = await Browser.storage.local.get('sidePanelSummaryAtom')
        if (storedSummaryText.sidePanelSummaryAtom) {
          setSummaryText(storedSummaryText.sidePanelSummaryAtom)
          // Remove the summary text from local storage after loading
          await Browser.storage.local.set({ sidePanelSummaryAtom: null })
        }
      } catch (error) {
        console.error('Error loading summary text from local storage:', error)
      }
    }

    loadSummaryTextFromLocalStorage()
  }, [])
  const chat = useChat(botId, agentId)

  useEffect(() => {
    if (tab === 'write') {
      setOpenWritingPreset(true)
    }
  }, [tab])

  const onSubmit = useCallback(
    async (input: string) => {
      chat.sendMessage(input)
    },
    [chat],
  )

  useEffect(() => {
    console.log('summaryText', summaryText)
    // send the prompt to the bot when the agent is set
    if (!summaryText?.type || summaryText?.content === null || chat.generating) {
      return
    }

    if (summaryText.type === 'writing-assistant') {
      setTab('write')
      setOpenWritingPreset(true)
      setSubTab(summaryText.subType ?? 'compose')
      if (summaryText.subType === 'reply') {
        if (summaryText.postData) {
          const promptFromPostData = generatePromptFromPostData(summaryText.postData)
          setOriginalTextAtom(promptFromPostData)
          setReplyContentAtom(summaryText.content ?? '')
          setFormatAtom(summaryText.format ?? 'comment')
        } else {
          setOriginalTextAtom(summaryText.content ?? '')
        }
      }
      if (summaryText.subType === 'compose') {
        setComposeTextAtom(summaryText.content ?? '')
      }
      setSummaryText((prev) => (!prev ? null : { ...prev, content: null }))
      return
    }
    if (
      summaryText.type === 'explain-a-concept' ||
      summaryText.type === 'summary-web-content' ||
      summaryText.type === 'summary-youtube-videos'
    ) {
      setTab('chat')
      const createAnwserNote = async (answers: string) => {
        const note = {
          content: answers,
          title: summaryText.title,
          parent_id: summaryText.noteId,
          type: summaryText.type,
        }

        //send note data to background
        chrome.runtime.sendMessage({ action: 'createAnwserNote', note })
      }
      if (chat.agentId === 'explain-a-concept') {
        const content = `As language teacher. Explain this: ${buildPromptWithLang(summaryText.content)}. Make it fun, simple and engaging! Don't repeat my question.`

        chat
          .sendMessage(content, undefined, { link: getLinkFromSummaryObject(summaryText), title: summaryText.content })
          .then(createAnwserNote)
        setSummaryText((prev) => (!prev ? null : { ...prev, content: null }))
        return
      }
      const content = buildPromptWithLang(summaryText.content)

      chat
        .sendMessage(content, undefined, { link: getLinkFromSummaryObject(summaryText), title: summaryText.title })
        .then(createAnwserNote)
      setSummaryText((prev) => (!prev ? null : { ...prev, content: null }))
    }
  }, [
    summaryText?.content,
    chat.generating,
    summaryText?.type,
    chat.agentId,
    summaryText,
    chat,
    setSubTab,
    setSummaryText,
    setOriginalTextAtom,
    setComposeTextAtom,
    setReplyContentAtom,
  ])

  const resetConversation = useCallback(() => {
    if (!chat.generating) {
      chat.resetConversation()
    }
  }, [chat])

  const context: ConversationContextValue = useMemo(() => {
    return {
      reset: resetConversation,
    }
  }, [resetConversation])

  const openMainApp = () => {
    chrome.runtime.sendMessage({
      action: 'openMainApp',
      agentId: agentId,
      botId: botId,
    })
  }

  const { sendMessage } = chat
  const [bingPingSent, setBingPingSent] = useAtom(bingPingSentAtom)

  useEffect(() => {
    if (botId === 'bing' && !bingPingSent) {
      sendMessage('ping')
      setBingPingSent(true)
    }
  }, [botId, sendMessage, bingPingSent, setBingPingSent])

  return (
    <ConversationContext.Provider value={context}>
      <div className="flex flex-col overflow-hidden bg-primary-background h-full">
        <div className="border-b border-solid border-primary-border flex flex-row items-center justify-between gap-2 pt-3 mx-3">
          <div className="flex flex-row items-center gap-1">
            <img src={logo} className="w-[30px] cursor-pointer" onClick={openMainApp} />
          </div>
          <span className="isolate inline-flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => {
                setTab('chat')
                if (agentId === 'writing-assistant') {
                  setSubTab('compose')
                }
              }}
              className={cx(
                'relative inline-flex items-center rounded-tl-2xl bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10',
                tab === 'chat'
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                  : 'ring-1 ring-inset ring-gray-300 bg-white text-gray-900 hover:bg-gray-50',
              )}
            >
              {t('Chat')}
            </button>
            <button
              onClick={() => {
                setTab('write')
              }}
              type="button"
              className={cx(
                'relative -ml-px inline-flex items-center  px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 rounded-tr-2xl',
                tab === 'write'
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                  : 'ring-1 ring-inset ring-gray-300 bg-white text-gray-900 hover:bg-gray-50',
              )}
            >
              {t('Write')}
            </button>
          </span>

          {/* {agent && <span className="text-primary-text">{agent.name}</span>} */}

          <div className="flex flex-row items-center gap-2">
            <img src={botInfo.avatar} className="w-4 h-4 object-contain rounded-full" />
            <div>
              <ChatbotName botId={botId} name={botInfo.name} onSwitchBot={setBotId} />
            </div>
          </div>

          <div className="flex flex-row items-center gap-3">
            <MenuDropDown onExpand={openMainApp} clearHistory={resetConversation} />
          </div>
        </div>
        <>
          <ChatMessageList
            onClick={(prompt) => {
              chat.sendMessage(prompt)
            }}
            avatar={null}
            botId={botId}
            messages={chat.messages}
            className="mx-3"
          />
          {tab === 'chat' ? (
            <>
              <Dialog
                title={t('Summarize Web')}
                open={openSummaryModal}
                onClose={() => {
                  setOpenSummaryModal(false)
                }}
                className="w-full mx-1 "
              >
                <img src={guildeWebContent} className="w-full  " />
              </Dialog>
              <div className="flex flex-col mx-3 my-3 gap-3">
                <hr className="grow border-primary-border" />
                <PrimaryButton
                  title={t('Summarize Web')}
                  onClick={async () => {
                    chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
                      if (!tab.id) {
                        return
                      }
                      try {
                        const result = await chrome.tabs.sendMessage(tab.id, { type: 'mountApp' })

                        if (result && result.type !== 'mounted') {
                          setOpenSummaryModal(true)
                        }
                      } catch (error) {
                        setOpenSummaryModal(true)
                      }
                    })
                  }}
                />
                <ChatMessageInput
                  mode="compact"
                  disabled={chat.generating}
                  autoFocus={true}
                  placeholder={t('Ask me anything...')}
                  onSubmit={onSubmit}
                  actionButton={
                    chat.generating ? (
                      <Button text={t('Stop')} color="flat" size="small" onClick={chat.stopGenerating} />
                    ) : (
                      <Button text={t('Send')} color="primary" type="submit" size="normal" className="text-lg" />
                    )
                  }
                />
              </div>
            </>
          ) : (
            <>
              <WritingPresetModal
                open={openWritingPreset}
                onClose={() => {
                  setOpenWritingPreset(false)
                }}
                onGenerate={(prompt) => {
                  setOpenWritingPreset(false)
                  chat.sendMessage(prompt)
                }}
              />
              <div className="flex flex-col mx-3 my-3 gap-3">
                <hr className="grow border-primary-border" />
                <PrimaryButton
                  title={t('Generate Draft')}
                  onClick={() => {
                    setOpenWritingPreset(true)
                  }}
                />
                <ChatMessageInput
                  mode="compact"
                  disabled={chat.generating}
                  autoFocus={true}
                  placeholder={t('Ask me anything...')}
                  onSubmit={onSubmit}
                  actionButton={
                    chat.generating ? (
                      <Button text={t('Stop')} color="flat" size="small" onClick={chat.stopGenerating} />
                    ) : (
                      <Button text={t('Send')} color="primary" type="submit" size="small" />
                    )
                  }
                />
              </div>
            </>
          )}
        </>
      </div>
    </ConversationContext.Provider>
  )
}

export default SidePanelPage
