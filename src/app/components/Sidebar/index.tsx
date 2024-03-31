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
import { FiSettings } from 'react-icons/fi'
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
import Button from '../Button'
import { PrimaryButton } from '../PrimaryButton'
import { RoundedSecondaryButton } from '../RoundedSecondaryButton'
import { BiCollapse } from 'react-icons/bi'
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
        <div
          className="cursor-pointer"
          onClick={() => {
            chrome.runtime.sendMessage({
              action: 'openSidePanelOnly',
            })
          }}
        >
          {collapsed ? <img src={logo} className="w-[30px]" /> : <img src={logo} className="w-[50px] ml-2" />}
        </div>
        <div className="flex flex-row justify-center items-center gap-2">
          <Link to="/setting">
            <FiSettings
              size={34}
              className="cursor-pointer p-[6px] rounded-[10px] w-fit  hover:opacity-80 bg-secondary"
              title={t('Prompt Library')}
            />
          </Link>
          <BiCollapse
            size={34}
            className="cursor-pointer p-[6px] rounded-[10px] w-fit  hover:opacity-80 bg-secondary"
            onClick={() => {
              chrome.runtime.sendMessage({
                action: 'openSidePanelOnly',
              })
            }}
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
      <div className="flex flex-col gap-[13px] mt-4 overflow-y-auto scrollbar-none">
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
        <div className="flex flex-row justify-between items-center ">
          <span>{t('Prompt bots')}</span>
          <FaRegEdit
            size={34}
            color="#000000"
            className="cursor-pointer p-[6px] rounded-[10px] w-fit  hover:opacity-80 bg-secondary"
            onClick={openPromptLibrary}
            title={t('Prompt Library')}
          />
        </div>
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

        {/* {chatStatesArray.length !== 0 && (
          <RoundedSecondaryButton title={t('Create prompt bot +')} onClick={openPromptLibrary} />
        )} */}
      </div>

      <div className="mt-auto pt-2">{!collapsed && <hr className="border-[#ffffff4d]" />}</div>
      <GuideModal />
    </motion.aside>
  )
}

export default Sidebar
