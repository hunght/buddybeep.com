import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { ChatGPTWebModels, UserConfig } from '~services/user-config'
import Select from '../Select'

interface Props {
  userConfig: UserConfig
  updateConfigValue: (update: Partial<UserConfig>) => void
}

const ChatGPWebSettings: FC<Props> = ({ userConfig, updateConfigValue }) => {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-1 w-[250px]">
      <p className="font-medium text-sm">{t('Model')}</p>
      <Select
        options={Object.entries(ChatGPTWebModels).map(([k, v]) => ({ name: k, value: v }))}
        value={userConfig.chatgptWebappModelName}
        onChange={(v) => updateConfigValue({ chatgptWebappModelName: v })}
      />
      {userConfig.chatgptWebappModelName.startsWith('gpt-4') && (
        <p className="text-sm mt-1 text-secondary-text">{t('GPT-4 models require ChatGPT Plus')}</p>
      )}
    </div>
  )
}

export default ChatGPWebSettings
