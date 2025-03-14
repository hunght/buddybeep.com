import { motion } from 'framer-motion'
import { FC, ReactNode, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import clearIcon from '~/assets/icons/clear.svg'

import shareIcon from '~/assets/icons/share.svg'
import { cx } from '~/utils'
import { CHATBOTS } from '~app/consts'
import { ConversationContext, ConversationContextValue } from '~app/context'
import { trackEvent } from '~app/plausible'
import { ChatMessageModel } from '~types'
import { BotId, BotInstance } from '../../bots'
import Button from '../Button'
import HistoryDialog from '../History/Dialog'
import ShareDialog from '../Share/Dialog'
import Tooltip from '../Tooltip'
import ChatMessageInput from './ChatMessageInput'
import ChatMessageList from './ChatMessageList'
import ChatbotName from './ChatbotName'
import WebAccessCheckbox from './WebAccessCheckbox'
import { getAllAgentsAtom } from '~app/state/agentAtom'
import { capitalize } from 'lodash-es'
import { useAtomValue } from 'jotai'
import { agentIcons } from '../AgentIcons'

interface Props {
  botId: BotId
  agentId: string | null
  bot: BotInstance
  messages: ChatMessageModel[]
  onUserSendMessage: (input: string, image?: File) => void
  resetConversation: () => void
  generating: boolean
  stopGenerating: () => void
  mode?: 'full' | 'compact'
  onSwitchBot?: (botId: BotId) => void
}

const ConversationPanel: FC<Props> = (props) => {
  const { t } = useTranslation()
  const botInfo = CHATBOTS[props.botId]
  const mode = props.mode || 'full'
  const marginClass = 'mx-5'
  const [showHistory, setShowHistory] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const allAgents = useAtomValue(getAllAgentsAtom)
  const context: ConversationContextValue = useMemo(() => {
    return {
      reset: props.resetConversation,
    }
  }, [props.resetConversation])

  const onSubmit = useCallback(
    async (input: string, image?: File) => {
      props.onUserSendMessage(input as string, image)
    },
    [props],
  )

  const resetConversation = useCallback(() => {
    if (!props.generating) {
      props.resetConversation()
    }
  }, [props])

  const openShareDialog = useCallback(() => {
    setShowShareDialog(true)
    trackEvent('open_share_dialog', { botId: props.botId })
  }, [props.botId])

  let inputActionButton: ReactNode = null
  if (props.generating) {
    inputActionButton = (
      <Button text={t('Stop')} color="flat" size={mode === 'full' ? 'normal' : 'tiny'} onClick={props.stopGenerating} />
    )
  } else if (mode === 'full') {
    inputActionButton = (
      <div className="flex flex-row items-center gap-[10px] shrink-0">
        <Button text={t('Send')} color="primary" type="submit" />
      </div>
    )
  }
  const agent = allAgents[props.agentId ?? '']
  const agentIcon = agentIcons[props.agentId ?? '']
  const avatar = agent ? (agentIcon ?? agent.avatar ?? agent.name.slice(0, 2)) : botInfo.avatar

  return (
    <ConversationContext.Provider value={context}>
      <div className={cx('flex flex-col overflow-hidden bg-primary-background h-full rounded-2xl')}>
        <div
          className={cx(
            'border-b border-solid border-primary-border flex flex-row items-center justify-between gap-2 py-[10px]',
            marginClass,
          )}
        >
          {agent ? (
            <div className="flex flex-row items-center gap-1">
              <div>
                {agentIcon ? (
                  <div className="w-10 h-10 text-2xl text-center items-center justify-center bg-secondary flex rounded-full">
                    {agentIcon}
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-secondary rounded-full flex justify-center items-center">
                    <span className="text-primary-text text-lg font-bold">{agent.name.slice(0, 2)}</span>
                  </div>
                )}
              </div>
              <span className="font-medium text-sm w-full">{agent.name + '-' + capitalize(botInfo.name)}</span>
            </div>
          ) : (
            <ChatbotName name={props.bot.name ?? ''} botId={props.botId} />
          )}
          <WebAccessCheckbox botId={props.botId} />
          <div className="flex flex-row items-center gap-3">
            <Tooltip content={t('Share conversation')}>
              <motion.img
                src={shareIcon}
                className="w-5 h-5 cursor-pointer"
                onClick={openShareDialog}
                whileHover={{ scale: 1.1 }}
              />
            </Tooltip>
            <Tooltip content={t('Clear conversation')}>
              <motion.img
                src={clearIcon}
                className={cx('w-5 h-5', props.generating ? 'cursor-not-allowed' : 'cursor-pointer')}
                onClick={resetConversation}
                whileHover={{ scale: 1.1 }}
              />
            </Tooltip>
          </div>
        </div>
        <ChatMessageList
          onClick={(prompt) => {
            props.onUserSendMessage(prompt)
          }}
          avatar={avatar}
          botId={props.botId}
          messages={props.messages}
          className={marginClass}
        />
        <div className={cx('mt-3 flex flex-col ', marginClass, mode === 'full' ? 'mb-3' : 'mb-[5px]')}>
          <div className={cx('flex flex-row items-center gap-[5px]', mode === 'full' ? 'mb-3' : 'mb-0')}>
            {mode === 'compact' && (
              <span className="font-medium text-xs text-light-text cursor-default">Send to {botInfo.name}</span>
            )}
            <hr className="grow border-primary-border" />
          </div>
          <ChatMessageInput
            mode={mode}
            disabled={props.generating}
            placeholder={mode === 'compact' ? '' : undefined}
            onSubmit={onSubmit}
            autoFocus={mode === 'full'}
            supportImageInput={mode === 'full' && props.bot.supportsImageInput}
            actionButton={inputActionButton}
          />
        </div>
      </div>
      {showShareDialog && (
        <ShareDialog open={true} onClose={() => setShowShareDialog(false)} messages={props.messages} />
      )}
      {showHistory && <HistoryDialog botId={props.botId} open={true} onClose={() => setShowHistory(false)} />}
    </ConversationContext.Provider>
  )
}

export default ConversationPanel
