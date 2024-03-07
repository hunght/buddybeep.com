import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import closeIcon from '~/assets/icons/close.svg'
import { agents } from '~app/hooks/agents'
import { BotId } from '~app/bots'
import Select from '../Select'
import { CHATBOTS } from '~app/consts'
import premiumIcon from '~/assets/icons/premium.svg'
import { ActionButton } from './ActionButton'

export const PromptItem = (props: {
  agentId: string
  title: string
  prompt: string
  edit?: () => void
  remove?: () => void
  copyToLocal?: (botId: BotId) => void
  insertPrompt: ({ botId, agentId }: { botId: BotId; agentId: string | null }) => void
}) => {
  const { t } = useTranslation()
  const [saved, setSaved] = useState(false)
  const [botId, setBotId] = useState<BotId>('gemini')

  const copyToLocal = useCallback(() => {
    props.copyToLocal?.(botId)
    setSaved(true)
  }, [botId, props])

  return (
    <div className="group relative flex flex-col space-y-4 rounded-lg border border-primary-border bg-primary-background px-5 py-4 shadow-sm transition duration-200 ease-in-out hover:border-gray-400 hover:shadow-md ">
      <div className="flex flex-row space-x-4 items-start">
        <img
          src={agents[props.agentId]?.avatar ?? premiumIcon}
          alt="Agent Avatar"
          className="w-24 h-24 rounded-full object-cover"
        />
        <div className="flex-1 max-w-96">
          <p className="w-full truncate text-sm font-semibold text-primary-text">{props.title}</p>
          <p className="mt-1 text-xs text-primary-text line-clamp-5">{props.prompt}</p>
          <div className="flex flex-row gap-2 items-center mt-2">
            {props.edit && <ActionButton text={t('Edit')} onClick={props.edit} />}
            {props.copyToLocal && <ActionButton text={t(saved ? 'Saved' : 'Save')} onClick={copyToLocal} />}
            <ActionButton text={t('Use')} onClick={() => props.insertPrompt({ botId, agentId: props.agentId })} />
            <div className="w-[120px]">
              <Select
                options={[...Object.entries(CHATBOTS).map(([botId, bot]) => ({ name: bot.name, value: botId }))]}
                value={botId}
                onChange={(v) => setBotId(v as BotId)}
              />
            </div>
          </div>
        </div>
      </div>
      {props.remove && (
        <img
          src={closeIcon}
          alt="Close"
          className="hidden group-hover:block absolute right-[-10px] top-[-10px] cursor-pointer w-6 h-6 rounded-full bg-primary-background p-1 transition duration-150 ease-in-out hover:bg-gray-200"
          onClick={props.remove}
        />
      )}
    </div>
  )
}
