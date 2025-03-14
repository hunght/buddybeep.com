import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { UserConfig } from '~services/user-config'
import Select from '../Select'
import Blockquote from './Blockquote'
import logger from '~utils/logger'

interface Props {
  userConfig: UserConfig
  updateConfigValue: (update: Partial<UserConfig>) => void
}

const ClaudeWebappSettings: FC<Props> = () => {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-1">
      <Blockquote className="mb-1">{t('Webapp mode uses your login session in current browser')}</Blockquote>
      <p className="font-medium text-sm">{t('Model')}</p>
      <div className="w-[250px] mb-1">
        <Select
          options={[{ name: 'Claude 3', value: 'claude-3-sonnet' }]}
          value="claude-3-sonnet"
          onChange={logger.log}
        />
      </div>
    </div>
  )
}

export default ClaudeWebappSettings
