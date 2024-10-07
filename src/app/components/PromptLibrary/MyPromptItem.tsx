import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BotId } from '~app/bots'
import Select from '../Select'

import { ActionButton } from './ActionButton'
import { useEnabledBots } from '~app/hooks/use-enabled-bots'

export const MyPromptItem = (props: {
  id: string
  title: string
  prompt: string
  edit?: (id: string, title: string, prompt: string) => void
  remove?: (id: string) => void
  clonePrompt?: (botId: BotId) => void
  insertPrompt: ({ botId, agentId }: { botId: BotId; agentId: string | null }) => void
}) => {
  const { t } = useTranslation()
  const { id } = props
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(props.title)
  const [editedPrompt, setEditedPrompt] = useState(props.prompt)
  const [saved, setSaved] = useState(false)
  const [botId, setBotId] = useState<BotId>('gemini')

  const bots = useEnabledBots()

  const handleEdit = useCallback(() => {
    setIsEditing(true)
    setEditedTitle(props.title)
    setEditedPrompt(props.prompt)
  }, [props.title, props.prompt])

  const handleSave = useCallback(() => {
    if (props.edit && id) {
      props.edit(id, editedTitle, editedPrompt)
      setIsEditing(false)
    }
  }, [props.edit, id, editedTitle, editedPrompt])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    setEditedTitle(props.title)
    setEditedPrompt(props.prompt)
  }, [props.title, props.prompt])

  const copyToLocal = useCallback(() => {
    props.clonePrompt?.(botId)
    setSaved(true)
  }, [botId, props.clonePrompt])

  const renderViewMode = () => (
    <>
      <div className="flex justify-between items-center mb-2">
        <p className="w-full truncate text-sm font-semibold text-primary-text">{props.title}</p>
        {props.edit && <ActionButton text={t('Edit')} onClick={handleEdit} className="ml-2 text-xs" />}
      </div>
      <p className="mt-1 text-xs dark:text-gray-400 line-clamp-5 min-h-20">{props.prompt}</p>
      <div className="flex flex-row gap-2 items-center mt-2 justify-between">
        <div className="flex flex-row gap-2">
          <button
            type="button"
            className="rounded bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            onClick={() => props.insertPrompt({ botId, agentId: id })}
          >
            {t('Use')}
          </button>
          {props.clonePrompt && (
            <ActionButton
              text={t('Clone')}
              onClick={copyToLocal}
              className={saved ? 'bg-green-500 hover:bg-green-400' : ''}
            />
          )}
        </div>
        <div className="w-[120px]">
          <Select
            options={[...bots.map(({ bot, botId }) => ({ name: bot.name, value: botId }))]}
            value={botId}
            onChange={(v) => setBotId(v as BotId)}
          />
        </div>
      </div>
    </>
  )

  const renderEditMode = () => (
    <>
      <input
        type="text"
        value={editedTitle}
        onChange={(e) => setEditedTitle(e.target.value)}
        className="w-full text-sm font-semibold text-primary-text mb-2 p-2 border rounded"
      />
      <textarea
        value={editedPrompt}
        onChange={(e) => setEditedPrompt(e.target.value)}
        className="w-full text-xs dark:text-gray-400 mb-2 p-2 border rounded"
        rows={5}
      />
      <div className="flex flex-row gap-2 mt-2 justify-between">
        <div className="flex flex-row gap-2">
          <ActionButton text={t('Save')} onClick={handleSave} />
          <ActionButton text={t('Cancel')} onClick={handleCancel} />
        </div>
        {props.remove && id && (
          <ActionButton
            text={t('Delete')}
            onClick={() => {
              props.remove?.(id)
              setIsEditing(false)
            }}
            className="bg-red-500 hover:bg-red-600 text-white"
          />
        )}
      </div>
    </>
  )

  return (
    <div className="group relative flex flex-col space-y-4 rounded-lg border border-primary-border dark:bg-gray-800 px-5 py-4 shadow-sm transition duration-200 ease-in-out hover:border-gray-400 hover:shadow-md max-w-3xl">
      <div className="flex flex-row space-x-4 items-start">
        <div className="flex-1 w-full">{isEditing ? renderEditMode() : renderViewMode()}</div>
      </div>
    </div>
  )
}
