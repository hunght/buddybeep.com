import { Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import logo from '~/assets/logo-64.png'
import { cx } from '~/utils'
import { FaRegEdit } from 'react-icons/fa'
import { FiSettings } from 'react-icons/fi'
import { sidebarCollapsedAtom } from '~app/state'

import GuideModal from '../GuideModal'

import Tooltip from '../Tooltip'
import NavLink from './NavLink'

import PromptLibraryDialog from '../PromptLibrary/Dialog'
import { trackEvent } from '~app/plausible'

import { getBotSlug } from '~app/utils/slug'
import { atomChatStateLocalStorage, chatStatesArrayAtomValue } from '~app/state/atomWithLocalStorage'
import { getAllAgentsAtom } from '~app/state/agentAtom'
import { InsertPropmtType } from '~app/types/InsertPropmtType'
import { useEnabledBots } from '~app/hooks/use-enabled-bots'

import { BiCollapse } from 'react-icons/bi'

function Sidebar() {
  const { t } = useTranslation()
  const [collapsed] = useAtom(sidebarCollapsedAtom)
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
    console.log('storedChatState', storedChatState)
    console.log('botSlug', botSlug)
    console.log('botId', botId)
    console.log('agentId', agentId)
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
    <motion.aside className={cx('flex flex-col  overflow-hidden', collapsed ? 'items-center px-[15px]' : 'w-96 px-4')}>
      <div className={cx('flex mt-8 gap-3 items-center', collapsed ? 'flex-col' : 'flex-row justify-between')}>
        <div
          className="cursor-pointer flex items-center gap-1"
          onClick={() => {
            chrome.runtime.sendMessage({
              action: 'openSidePanelOnly',
            })
          }}
        >
          {collapsed ? <img src={logo} className="w-[30px]" /> : <img src={logo} className=" ml-2 w-16" />}
          <div className="flex flex-col font-bold">
            <span>Buddy </span>
            <span>Beep</span>
          </div>
        </div>

        <div className="flex flex-row justify-center items-center gap-2">
          <Tooltip content={t('Settings')}>
            <Link to="/setting">
              <FiSettings
                size={34}
                className="cursor-pointer p-[6px] rounded-[10px] w-fit  hover:opacity-80 bg-secondary"
                title={t('Prompt Library')}
              />
            </Link>
          </Tooltip>
          <Tooltip content={t('Collapse')}>
            <div>
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
          </Tooltip>
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
            className="cursor-pointer p-[6px] rounded-[10px] w-fit  hover:opacity-80 bg-secondary text-primary-text"
            onClick={openPromptLibrary}
            title={t('Prompt Library')}
          />
        </div>
        {chatStatesArray.map(({ botId, agentId, lastMessage }) => {
          if (!agentId) {
            return null
          }
          const agent = allAgents[agentId]

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

        {chatStatesArray.length === 0 && (
          //  no prompts message
          <div className="flex flex-col gap-2">
            <div className="flex flex-row justify-center items-center  text-secondary-text">
              <span>{t('No prompts')}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto pt-2">{!collapsed && <hr className="border-[#ffffff4d]" />}</div>
      <GuideModal />
    </motion.aside>
  )
}

export default Sidebar
