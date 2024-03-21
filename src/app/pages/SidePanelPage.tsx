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

import { buildPromptWithLang } from '~app/utils/lang'
import { WriteReplyUI } from '~app/components/write-reply'

function SidePanelPage() {
  const [tab, setTab] = useState<'chat' | 'write'>('chat')
  const { t } = useTranslation()
  const [botId, setBotId] = useAtom(sidePanelBotAtom)
  const [summaryText, setSummaryText] = useAtom(sidePanelSummaryAtom)

  const botInfo = CHATBOTS[botId]
  const agentId = summaryText?.type ?? 'summary-web-content'

  const chat = useChat(botId, agentId)

  useEffect(() => {
    chrome.storage.local.get('sidePanelSummaryAtom').then((data) => {
      if (data.sidePanelSummaryAtom) {
        setSummaryText(data.sidePanelSummaryAtom)
        chrome.storage.local.set({ sidePanelSummaryAtom: null })
      }
    })
  }, [])

  const onSubmit = useCallback(
    async (input: string) => {
      chat.sendMessage(input)
    },
    [chat],
  )
  useEffect(() => {
    if (summaryText?.content) {
      const content = buildPromptWithLang(summaryText.content)
      chat.sendMessage(content, undefined, { link: summaryText.link, title: summaryText.title })
      setSummaryText((prev) => (!prev ? null : { ...prev, content: null }))
    }
  }, [chat, setSummaryText, summaryText])

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
        {tab === 'chat' ? (
          <>
            <ChatMessageList avatar={null} botId={botId} messages={chat.messages} className="mx-3" />
            <div className="flex flex-col mx-3 my-3 gap-3">
              <hr className="grow border-primary-border" />
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
        ) : (
          <WriteReplyUI />
        )}
      </div>
    </ConversationContext.Provider>
  )
}

export default SidePanelPage
