import { motion } from 'framer-motion'
import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import Browser from 'webextension-polyfill'
 
import { Input } from '~app/components/Input'
import RadioGroup from '~app/components/RadioGroup'
import Select from '~app/components/Select'
import Blockquote from '~app/components/Settings/Blockquote'
 
import ClaudeAPISettings from '~app/components/Settings/ClaudeAPISettings'
import ClaudeOpenRouterSettings from '~app/components/Settings/ClaudeOpenRouterSettings'
import ClaudePoeSettings from '~app/components/Settings/ClaudePoeSettings'
import ClaudeWebappSettings from '~app/components/Settings/ClaudeWebappSettings'
import EnabledBotsSettings from '~app/components/Settings/EnabledBotsSettings'
 
import ShortcutPanel from '~app/components/Settings/ShortcutPanel'
 
import { debounce } from 'lodash-es'

import {
  BingConversationStyle,
  ChatGPTMode,
  ClaudeMode,
  PerplexityMode,
  UserConfig,
  getUserConfig,
  updateUserConfig,
} from '~services/user-config'
import { getVersion } from '~utils'
import PagePanel from '../components/Page'
import Tooltip from '~app/components/Tooltip'
import ThemeSettingModal from '~app/components/ThemeSettingModal'
import { IconButton } from '~app/components/Sidebar/IconButton'
import { LanguageSelection } from './LanguageSelection'
import logger from '~utils/logger'

const BING_STYLE_OPTIONS = [
  { name: 'Precise', value: BingConversationStyle.Precise },
  { name: 'Balanced', value: BingConversationStyle.Balanced },
  { name: 'Creative', value: BingConversationStyle.Creative },
]

const ChatBotSettingPanel: FC<PropsWithChildren<{ title: string }>> = (props) => {
  return (
    <div className="flex flex-col gap-1 border border-primary-border px-5 py-4 rounded-lg shadow-sm">
      <p className="font-bold text-md">{props.title}</p>
      {props.children}
    </div>
  )
}

function SettingPage() {
  const { t } = useTranslation()
  const [userConfig, setUserConfig] = useState<UserConfig | undefined>(undefined)
  const [transcriptWidgetVisible, setTranscriptWidgetVisible] = useState(true)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getUserConfig().then((config) => setUserConfig(config))
    chrome.storage.sync.get(['transcriptWidgetVisible'], (result) => {
      setTranscriptWidgetVisible(result.transcriptWidgetVisible !== false)
    })
  }, [])

  const debouncedSave = useCallback(
    debounce((config: UserConfig) => {
      save(config)
    }, 1000),
    [],
  )

  const updateConfigValue = useCallback(
    (update: Partial<UserConfig>) => {
      setUserConfig((prevConfig) => {
        const newConfig = { ...prevConfig!, ...update }
        debouncedSave(newConfig)
        return newConfig
      })
      console.log('updateConfigValue ===', update)
    },
    [debouncedSave],
  )

  const save = useCallback(
    async (config: UserConfig) => {
      setSaving(true)
      let apiHost = config.openaiApiHost
      if (apiHost) {
        apiHost = apiHost.replace(/\/$/, '')
        if (!apiHost.startsWith('http')) {
          apiHost = 'https://' + apiHost
        }
        // request host permission to prevent CORS issues
        try {
          await Browser.permissions.request({ origins: [apiHost + '/'] })
        } catch (e) {
          logger.error('[SettingPage][useCallback]', e)
        }
      } else {
        apiHost = undefined
      }
      await updateUserConfig({ ...config, openaiApiHost: apiHost })
      await chrome.storage.sync.set({ transcriptWidgetVisible })

      setSaving(false)
      setDirty(false)
      toast.success('Saved')
    },
    [transcriptWidgetVisible],
  )

  const handleTranscriptWidgetToggle = useCallback((isVisible: boolean) => {
    setTranscriptWidgetVisible(isVisible)
    chrome.storage.sync.set({ transcriptWidgetVisible: isVisible })
    debouncedSave(userConfig!)
  }, [])

  if (!userConfig) {
    return null
  }

  if (!userConfig) {
    return null
  }

  return (
    <PagePanel title={`${t('Settings')} (v${getVersion()})`}>
      <div className="flex flex-col gap-5 mt-3 mb-10 px-10">
        <div className="flex flex-col gap-2 max-w-[700px]">
          <p className="font-bold text-lg">{t('Chatbots')}</p>
          <EnabledBotsSettings userConfig={userConfig} updateConfigValue={updateConfigValue} />
        </div>
        <div className="flex flex-col gap-5 w-fit max-w-[700px]">
          {/* <ChatBotSettingPanel title="ChatGPT">
                <RadioGroup
                  options={Object.entries(ChatGPTMode).map(([k, v]) => ({ label: `${k} ${t('Mode')}`, value: v }))}
                  value={userConfig.chatgptMode}
                  onChange={(v) => updateConfigValue({ chatgptMode: v as ChatGPTMode })}
                />
                {userConfig.chatgptMode === ChatGPTMode.API ? (
                  <ChatGPTAPISettings userConfig={userConfig} updateConfigValue={updateConfigValue} />
                ) : userConfig.chatgptMode === ChatGPTMode.Azure ? (
                  <ChatGPTAzureSettings userConfig={userConfig} updateConfigValue={updateConfigValue} />
                ) : userConfig.chatgptMode === ChatGPTMode.Poe ? (
                  <ChatGPTPoeSettings userConfig={userConfig} updateConfigValue={updateConfigValue} />
                ) : userConfig.chatgptMode === ChatGPTMode.OpenRouter ? (
                  <ChatGPTOpenRouterSettings userConfig={userConfig} updateConfigValue={updateConfigValue} />
                ) : (
                  <ChatGPWebSettings userConfig={userConfig} updateConfigValue={updateConfigValue} />
                )}
              </ChatBotSettingPanel> */}

          <ChatBotSettingPanel title="Gemini Pro">
            <div className="flex flex-col gap-1">
              <p className="font-medium text-sm">
                API Key (
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  how to create key
                </a>
                )
              </p>
              <Input
                className="w-[400px] dark:bg-gray-800 dark:text-white"
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={userConfig.geminiApiKey}
                onChange={(e) => updateConfigValue({ geminiApiKey: e.currentTarget.value })}
                type="password"
              />
              <Blockquote className="mt-1">{t('Your keys are stored locally')}</Blockquote>
            </div>
          </ChatBotSettingPanel>
          <ChatBotSettingPanel title="Bing">
            <div className="flex flex-row gap-5 items-center">
              <p className="font-medium">{t('Chat style')}</p>
              <div className="w-[150px]">
                <Select
                  options={BING_STYLE_OPTIONS}
                  value={userConfig.bingConversationStyle}
                  onChange={(v) => updateConfigValue({ bingConversationStyle: v })}
                  position="top"
                />
              </div>
            </div>
          </ChatBotSettingPanel>
          <ChatBotSettingPanel title="Claude">
            <RadioGroup
              options={Object.entries(ClaudeMode).map(([k, v]) => ({ label: `${k} ${t('Mode')}`, value: v }))}
              value={userConfig.claudeMode}
              onChange={(v) => updateConfigValue({ claudeMode: v as ClaudeMode })}
            />
            {userConfig.claudeMode === ClaudeMode.API ? (
              <ClaudeAPISettings userConfig={userConfig} updateConfigValue={updateConfigValue} />
            ) : userConfig.claudeMode === ClaudeMode.Webapp ? (
              <ClaudeWebappSettings userConfig={userConfig} updateConfigValue={updateConfigValue} />
            ) : userConfig.claudeMode === ClaudeMode.OpenRouter ? (
              <ClaudeOpenRouterSettings userConfig={userConfig} updateConfigValue={updateConfigValue} />
            ) : (
              <ClaudePoeSettings userConfig={userConfig} updateConfigValue={updateConfigValue} />
            )}
          </ChatBotSettingPanel>
          {/* <ChatBotSettingPanel title="Perplexity">
            <RadioGroup
              options={Object.entries(PerplexityMode).map(([k, v]) => ({ label: `${k} ${t('Mode')}`, value: v }))}
              value={userConfig.perplexityMode}
              onChange={(v) => updateConfigValue({ perplexityMode: v as PerplexityMode })}
            />
            {userConfig.perplexityMode === PerplexityMode.API && (
              <PerplexityAPISettings userConfig={userConfig} updateConfigValue={updateConfigValue} />
            )}
          </ChatBotSettingPanel> */}
        </div>
        <div className="flex flex-col gap-2 max-w-[700px]">
          <p className="font-bold text-lg">{t('YouTube Transcript Widget')}</p>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="transcriptWidgetToggle"
              checked={transcriptWidgetVisible}
              onChange={(e) => handleTranscriptWidgetToggle(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="transcriptWidgetToggle">{t('Show YouTube Transcript Widget')}</label>
          </div>
        </div>
        <ShortcutPanel />
        {/* <ExportDataPanel /> */}
        <div className="w-[300px]">
          <p className="font-bold text-lg mb-3">{t('Language')}</p>
          <LanguageSelection />
        </div>
        <ThemeSettingModal />
      </div>
      {(dirty || saving) && (
        <motion.div
          className="sticky bottom-0 w-full bg-primary-background border-t-2 border-primary-border px-5 py-4 drop-shadow flex flex-row items-center justify-center"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: 'tween', ease: 'easeInOut' }}
        >
          {saving ? <p>{t('Saving...')}</p> : <p>{t('Changes will be saved automatically')}</p>}
        </motion.div>
      )}
      <Toaster position="bottom-center" />
    </PagePanel>
  )
}

export default SettingPage
