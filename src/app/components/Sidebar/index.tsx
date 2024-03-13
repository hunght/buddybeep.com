import { Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import collapseIcon from '~/assets/icons/collapse.svg'
import feedbackIcon from '~/assets/icons/feedback.svg'
import githubIcon from '~/assets/icons/github.svg'
import settingIcon from '~/assets/icons/setting.svg'

import logo from '~/assets/santa-logo.png'
import { cx } from '~/utils'
import { FaRegEdit } from 'react-icons/fa'

import { releaseNotesAtom, showDiscountModalAtom, sidebarCollapsedAtom } from '~app/state'
import { getPremiumActivation } from '~services/premium'
import { checkReleaseNotes } from '~services/release-notes'
import * as api from '~services/server-api'
import { getAppOpenTimes, getPremiumModalOpenTimes } from '~services/storage/open-times'
import GuideModal from '../GuideModal'
import ThemeSettingModal from '../ThemeSettingModal'
import Tooltip from '../Tooltip'
import NavLink from './NavLink'
import PremiumEntry from './PremiumEntry'
import PromptLibraryDialog from '../PromptLibrary/Dialog'
import { trackEvent } from '~app/plausible'

import { getBotSlug } from '~app/utils/slug'
import { atomChatStateLocalStorage, chatStatesArrayAtomValue } from '~app/state/atomWithLocalStorage'
import { getAllAgentsAtom } from '~app/state/agentAtom'
import { InsertPropmtType } from '~app/types/InsertPropmtType'
import { useEnabledBots } from '~app/hooks/use-enabled-bots'
import { IconButton } from './IconButton'

function Sidebar() {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useAtom(sidebarCollapsedAtom)
  const allAgents = useAtomValue(getAllAgentsAtom)
  const chatStatesArray = useAtomValue(chatStatesArrayAtomValue)

  const [chatStateLocalStorage, setChatStateLocalStorage] = useAtom(atomChatStateLocalStorage)

  const [isPromptLibraryDialogOpen, setIsPromptLibraryDialogOpen] = useState(false)
  const navigate = useNavigate()

  const openPromptLibrary = useCallback(() => {
    setIsPromptLibraryDialogOpen(true)
    trackEvent('open_prompt_library')
  }, [])

  const insertPrompt: InsertPropmtType = ({ botId, agentId }): void => {
    const botSlug = getBotSlug({ botId, agentId })
    const storedChatState = chatStateLocalStorage[botSlug]
    if (!storedChatState) {
      setChatStateLocalStorage((prev) => {
        return {
          ...prev,
          [botSlug]: {
            botId,
            agentId,
            messages: [],
            isSetup: false,
            generatingMessageId: '',
            conversationId: '',
            lastMessage: null,
          },
        }
      })
    }
    if (agentId) {
      //navigate to the agent
      navigate({ to: '/chat-agent/$agentId/$botId', params: { agentId, botId } })
    } else {
      //navigate to the bot
      navigate({ to: '/chat/$botId', params: { botId } })
    }
    setIsPromptLibraryDialogOpen(false)
  }
  const enabledBots = useEnabledBots()
  return (
    <motion.aside
      className={cx(
        'flex flex-col bg-primary-background bg-opacity-40 overflow-hidden',
        collapsed ? 'items-center px-[15px]' : 'w-96 px-4',
      )}
    >
      <div className={cx('flex mt-8 gap-3 items-center', collapsed ? 'flex-col' : 'flex-row justify-between')}>
        {collapsed ? <img src={logo} className="w-[30px]" /> : <img src={logo} className="w-[50px] ml-2" />}
        <div className="flex flex-row justify-center items-center gap-2">
          <Tooltip content={t('Settings')}>
            <Link to="/setting">
              <IconButton icon={settingIcon} />
            </Link>
          </Tooltip>
          <FaRegEdit
            size={34}
            color="#ffffffb3"
            className="cursor-pointer p-[6px] rounded-[10px] w-fit  hover:opacity-80 bg-secondary bg-opacity-20"
            onClick={openPromptLibrary}
            title={t('Prompt Library')}
          />
        </div>
        {isPromptLibraryDialogOpen && (
          <PromptLibraryDialog
            isOpen={true}
            onClose={() => setIsPromptLibraryDialogOpen(false)}
            insertPrompt={insertPrompt}
          />
        )}
      </div>
      <div className="flex flex-col gap-[13px] mt-10 overflow-y-auto scrollbar-none">
        <span>{t('Original bots')}</span>
        {enabledBots.map(({ botId, bot }) => {
          return (
            <NavLink
              key={botId}
              botId={botId}
              botName={bot.name}
              icon={bot.avatar}
              iconOnly={collapsed}
              lastMessage={chatStateLocalStorage[getBotSlug({ botId, agentId: null })]?.lastMessage ?? null}
            />
          )
        })}
        <span>{t('Prompt bots')}</span>
        {chatStatesArray.map(({ botId, agentId, lastMessage }) => {
          const agent = allAgents[agentId ?? '']

          return (
            <NavLink
              key={getBotSlug({ botId, agentId })}
              botId={botId}
              agent={agent}
              lastMessage={lastMessage}
              iconOnly={collapsed}
            />
          )
        })}
      </div>

      <div className="mt-auto pt-2">{!collapsed && <hr className="border-[#ffffff4d]" />}</div>
      <GuideModal />
    </motion.aside>
  )
}

export default Sidebar
