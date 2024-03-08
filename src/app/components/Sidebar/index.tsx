import { Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import collapseIcon from '~/assets/icons/collapse.svg'
import feedbackIcon from '~/assets/icons/feedback.svg'
import githubIcon from '~/assets/icons/github.svg'
import settingIcon from '~/assets/icons/setting.svg'
import themeIcon from '~/assets/icons/theme.svg'
import minimalLogo from '~/assets/minimal-logo.svg'
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
import { allAgents } from '~app/state/agentAtom'
import { InsertPropmtType } from '~app/types/InsertPropmtType'

function IconButton(props: { icon: string; onClick?: () => void }) {
  return (
    <div
      className="p-[6px] rounded-[10px] w-fit cursor-pointer hover:opacity-80 bg-secondary bg-opacity-20"
      onClick={props.onClick}
    >
      <img src={props.icon} className="w-6 h-6" />
    </div>
  )
}

function Sidebar() {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useAtom(sidebarCollapsedAtom)
  const [themeSettingModalOpen, setThemeSettingModalOpen] = useState(false)
  const chatStatesArray = useAtomValue(chatStatesArrayAtomValue)

  const [chatStateLocalStorage, setChatStateLocalStorage] = useAtom(atomChatStateLocalStorage)
  const setShowDiscountModal = useSetAtom(showDiscountModalAtom)
  const setReleaseNotes = useSetAtom(releaseNotesAtom)
  const [isPromptLibraryDialogOpen, setIsPromptLibraryDialogOpen] = useState(false)
  const navigate = useNavigate()
  useEffect(() => {
    Promise.all([getAppOpenTimes(), getPremiumModalOpenTimes(), checkReleaseNotes()]).then(
      async ([appOpenTimes, premiumModalOpenTimes, releaseNotes]) => {
        if (!getPremiumActivation()) {
          const { show, campaign } = await api.checkDiscount({ appOpenTimes, premiumModalOpenTimes })
          if (show) {
            setShowDiscountModal(true)
            return
          }
          if (campaign) {
            setShowDiscountModal(campaign)
            return
          }
        }
        setReleaseNotes(releaseNotes)
      },
    )
  }, [])

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

  return (
    <motion.aside
      className={cx(
        'flex flex-col bg-primary-background bg-opacity-40 overflow-hidden',
        collapsed ? 'items-center px-[15px]' : 'w-[230px] px-4',
      )}
    >
      <div className={cx('flex mt-8 gap-3 items-center', collapsed ? 'flex-col' : 'flex-row justify-between')}>
        {collapsed ? <img src={minimalLogo} className="w-[30px]" /> : <img src={logo} className="w-[100px] ml-2" />}
        <motion.img
          src={collapseIcon}
          className={cx('w-6 h-6 cursor-pointer')}
          animate={{ rotate: collapsed ? 180 : 0 }}
          onClick={() => setCollapsed((c) => !c)}
        />
        <FaRegEdit
          size={22}
          color="#ffffffb3"
          className="cursor-pointer"
          onClick={openPromptLibrary}
          title="Prompt library"
        />

        {isPromptLibraryDialogOpen && (
          <PromptLibraryDialog
            isOpen={true}
            onClose={() => setIsPromptLibraryDialogOpen(false)}
            insertPrompt={insertPrompt}
          />
        )}
      </div>
      <div className="flex flex-col gap-[13px] mt-10 overflow-y-auto scrollbar-none">
        {chatStatesArray.map(({ botId, agentId }) => {
          return (
            <NavLink
              key={getBotSlug({ botId, agentId })}
              botId={botId}
              agent={allAgents[agentId ?? '']}
              iconOnly={collapsed}
            />
          )
        })}
      </div>
      <div className="mt-auto pt-2">
        {!collapsed && <hr className="border-[#ffffff4d]" />}
        {!collapsed && (
          <div className="my-5">
            <PremiumEntry text={t('Premium')} />
          </div>
        )}
        <div className={cx('flex mt-5 gap-[10px] mb-4', collapsed ? 'flex-col' : 'flex-row ')}>
          {!collapsed && (
            <Tooltip content={t('GitHub')}>
              <a href="https://github.com/chathub-dev/chathub?utm_source=extension" target="_blank" rel="noreferrer">
                <IconButton icon={githubIcon} />
              </a>
            </Tooltip>
          )}
          {!collapsed && (
            <Tooltip content={t('Feedback')}>
              <a href="https://github.com/chathub-dev/chathub/issues" target="_blank" rel="noreferrer">
                <IconButton icon={feedbackIcon} />
              </a>
            </Tooltip>
          )}
          {!collapsed && (
            <Tooltip content={t('Display')}>
              <a onClick={() => setThemeSettingModalOpen(true)}>
                <IconButton icon={themeIcon} />
              </a>
            </Tooltip>
          )}
          <Tooltip content={t('Settings')}>
            <Link to="/setting">
              <IconButton icon={settingIcon} />
            </Link>
          </Tooltip>
        </div>
      </div>
      <GuideModal />
      <ThemeSettingModal open={themeSettingModalOpen} onClose={() => setThemeSettingModalOpen(false)} />
    </motion.aside>
  )
}

export default Sidebar
