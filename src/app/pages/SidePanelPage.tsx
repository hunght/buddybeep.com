import { useAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import clearIcon from '~/assets/icons/clear.svg'
import { cx } from '~/utils'
import Button from '~app/components/Button'
import ChatMessageInput from '~app/components/Chat/ChatMessageInput'
import ChatMessageList from '~app/components/Chat/ChatMessageList'
import ChatbotName from '~app/components/Chat/ChatbotName'
import { CHATBOTS } from '~app/consts'
import { ConversationContext, ConversationContextValue } from '~app/context'
import { useChat } from '~app/hooks/use-chat'
import { sidePanelBotAtom, sidePanelSummaryAtom } from '~app/state/sidePanelAtom'
import { LanguageSelection } from './LanguageSelection'

import logo from '~/assets/santa-logo.png'

import { WritingPresetModal } from '~app/components/write-reply/modal'
import { PrimaryButton } from '~app/components/PrimaryButton'
import { buildPromptWithLang } from '~app/utils/lang'
import { composeTextAtom, originalTextAtom, subTabAtom } from '~app/state/writingAssistantAtom'

function SidePanelPage() {
  const [tab, setTab] = useState<'chat' | 'write'>('chat')
  const { t } = useTranslation()
  const [botId, setBotId] = useAtom(sidePanelBotAtom)
  const [summaryText, setSummaryText] = useAtom(sidePanelSummaryAtom)
  const [openWritingPreset, setOpenWritingPreset] = useState(false)
  const [, setOriginalTextAtom] = useAtom(originalTextAtom)
  const [, setComposeTextAtom] = useAtom(composeTextAtom)

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
    chrome.storage.local.get('sidePanelSummaryAtom').then((data) => {
      if (data.sidePanelSummaryAtom) {
        setSummaryText(data.sidePanelSummaryAtom)
        chrome.storage.local.set({ sidePanelSummaryAtom: { ...data.sidePanelSummaryAtom, content: null } })
      }
    })
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
    // send the prompt to the bot when the agent is set
    if (!summaryText?.type || summaryText?.content === null || chat.generating) {
      return
    }

    if (summaryText.type === 'writing-assistant') {
      setTab('write')
      setOpenWritingPreset(true)
      setSubTab(summaryText.subType ?? 'compose')
      if (summaryText.subType === 'reply') {
        setOriginalTextAtom(summaryText.content ?? '')
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

      if (chat.agentId === 'explain-a-concept') {
        const content = `As language teacher. Explain this: ${buildPromptWithLang(summaryText.content)}. Make it fun, simple and engaging! Don't repeat my question.`

        chat.sendMessage(content, undefined, { link: summaryText.link, title: summaryText.content })
        setSummaryText((prev) => (!prev ? null : { ...prev, content: null }))
        return
      }
      const content = buildPromptWithLang(summaryText.content)

      chat.sendMessage(content, undefined, { link: summaryText.link, title: summaryText.title })
      setSummaryText((prev) => (!prev ? null : { ...prev, content: null }))
    }
  }, [summaryText?.content, chat.generating, summaryText?.type, chat.agentId])

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

  return (
    <ConversationContext.Provider value={context}>
      <div className="flex flex-col overflow-hidden bg-primary-background h-full">
        <div className="border-b border-solid border-primary-border flex flex-row items-center justify-between gap-2 pt-3 mx-3">
          <img
            src={logo}
            className="w-[30px] cursor-pointer"
            onClick={() => {
              chrome.runtime.sendMessage({
                action: 'openMainApp',
                agentId: agentId,
                botId: botId,
              })
            }}
          />
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
            <ChatbotName botId={botId} name={botInfo.name} onSwitchBot={setBotId} />
          </div>
          <div className="w-30">
            <LanguageSelection />
          </div>
          <div className="flex flex-row items-center gap-3">
            <img
              src={clearIcon}
              className={cx('w-4 h-4', chat.generating ? 'cursor-not-allowed' : 'cursor-pointer')}
              onClick={resetConversation}
            />
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
            <div className="flex flex-col mx-3 my-3 gap-3">
              <hr className="grow border-primary-border" />
              <PrimaryButton
                title={t('Summary Web Content')}
                onClick={() => {
                  console.log(`==== summaryText ===`)
                  console.log(summaryText)
                  console.log('==== end log ===')
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
                  placeholder="Ask me anything..."
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
