import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import closeIcon from '~/assets/icons/close.svg'

import { BotId } from '~app/bots'
import Select from '../Select'

import { ActionButton } from './ActionButton'
import { useEnabledBots } from '~app/hooks/use-enabled-bots'
import { getAllAgentsAtom } from '~app/state/agentAtom'
import { useAtomValue } from 'jotai'
import { agentIcons } from '../AgentIcons'

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
  const allAgents = useAtomValue(getAllAgentsAtom)
  const bots = useEnabledBots()
  const agentIcon = agentIcons[props.agentId]
  const copyToLocal = useCallback(() => {
    props.copyToLocal?.(botId)
    setSaved(true)
  }, [botId, props])
  const agent = allAgents[props.agentId]
  return (
    <div className="group relative flex flex-col space-y-4 rounded-lg border border-primary-border dark:bg-gray-800 px-5 py-4 shadow-sm transition duration-200 ease-in-out hover:border-gray-400 hover:shadow-md ">
      <div className="flex flex-row space-x-4 items-start">
        <div>
          {agentIcon ? (
            <div className="w-24 h-24 text-5xl text-center items-center justify-center bg-secondary flex rounded-full">
              {agentIcon}
            </div>
          ) : (
            <div className="w-24 h-24  object-cover bg-secondary rounded-full flex justify-center items-center">
              <span className="text-primary-text text-4xl font-bold">{agent?.name?.slice(0, 2)}</span>
            </div>
          )}
        </div>

        <div className="flex-1 max-w-96">
          <p className="w-full truncate text-sm font-semibold text-primary-text">{props.title}</p>
          <p className="mt-1 text-xs dark:text-gray-400 line-clamp-5">{props.prompt}</p>
          <div className="flex flex-row gap-2 items-center mt-2 justify-between">
            <div className="flex flex-row gap-2">
              {props.edit && <ActionButton text={t('Edit')} onClick={props.edit} />}
              {/* {props.copyToLocal && <ActionButton text={t(saved ? 'Saved' : 'Save')} onClick={copyToLocal} />} */}

              <button
                type="button"
                className="rounded bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                onClick={() => props.insertPrompt({ botId, agentId: props.agentId })}
              >
                {t('Use')}
              </button>
            </div>
            <div className="w-[120px]">
              <Select
                options={[...bots.map(({ bot, botId }) => ({ name: bot.name, value: botId }))]}
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
