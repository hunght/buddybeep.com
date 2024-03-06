import { Suspense, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BeatLoader } from 'react-spinners'
import useSWR from 'swr'
import closeIcon from '~/assets/icons/close.svg'
import { trackEvent } from '~app/plausible'
import { Prompt, loadLocalPrompts, removeLocalPrompt, saveLocalPrompt } from '~services/prompts'
import { uuid } from '~utils'
import Button from '../Button'
import { Input, Textarea } from '../Input'
import { agents } from '~app/hooks/agents'
import { BotId } from '~app/bots'
import Select from '../Select'
import { CHATBOTS } from '~app/consts'

const ActionButton = (props: { text: string; onClick: () => void }) => {
  return (
    <a
      className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 cursor-pointer"
      onClick={props.onClick}
    >
      {props.text}
    </a>
  )
}

const PromptItem = (props: {
  agentId: string
  title: string
  prompt: string
  edit?: () => void
  remove?: () => void
  copyToLocal?: (botId: BotId) => void
  insertPrompt: (botId: BotId, agentId: string) => void
}) => {
  const { t } = useTranslation()
  const [saved, setSaved] = useState(false)
  const [botId, setBotId] = useState<BotId>('gemini')

  const copyToLocal = useCallback(() => {
    props.copyToLocal?.(botId)
    setSaved(true)
  }, [botId, props])

  return (
    <div className="group relative flex space-x-3 rounded-lg border border-primary-border bg-primary-background px-5 py-4 shadow-sm hover:border-gray-400 flex-col items-start">
      <div className="flex flex-row">
        <img src={agents[props.agentId].avatar ?? ''} className="w-10 h-10 rounded-full" />
        <div>
          <p className="truncate text-sm font-medium text-primary-text">{props.title}</p>
          <p className="text-xs text-primary-text line-clamp-5">{props.prompt}</p>
          <div className="flex flex-row gap-1">
            {props.edit && <ActionButton text={t('Edit')} onClick={props.edit} />}
            {props.copyToLocal && <ActionButton text={t(saved ? 'Saved' : 'Save')} onClick={copyToLocal} />}
            <ActionButton text={t('Use')} onClick={() => props.insertPrompt(botId, props.agentId)} />
            <div className="w-[100px]">
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
          className="hidden group-hover:block absolute right-[-8px] top-[-8px] cursor-pointer w-4 h-4 rounded-full bg-primary-background"
          onClick={props.remove}
        />
      )}
    </div>
  )
}

function PromptForm(props: { initialData: Prompt; onSubmit: (data: Prompt) => void; onClose: () => void }) {
  const { t } = useTranslation()

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      e.stopPropagation()
      const formdata = new FormData(e.currentTarget)
      const json = Object.fromEntries(formdata.entries())
      if (json.title && json.prompt) {
        props.onSubmit({
          agentId: props.initialData.agentId,
          name: json.title as string,
          prompt: json.prompt as string,
          botId: json.botId as BotId,
        })
      }
    },
    [props],
  )

  return (
    <form className="flex flex-col gap-2 w-full" onSubmit={onSubmit}>
      <div className="w-full">
        <span className="text-sm font-semibold block mb-1 text-primary-text">Prompt {t('Title')}</span>
        <Input className="w-full" name="title" defaultValue={props.initialData.name} />
      </div>
      <div className="w-full">
        <span className="text-sm font-semibold block mb-1 text-primary-text">Prompt {t('Content')}</span>
        <Textarea className="w-full" name="prompt" defaultValue={props.initialData.prompt} />
      </div>
      <div className="flex flex-row gap-2 mt-1">
        <Button color="primary" text={t('Save')} className="w-fit" size="small" type="submit" />
        <Button color="flat" text={t('Cancel')} className="w-fit" size="small" onClick={props.onClose} />
      </div>
    </form>
  )
}

function LocalPrompts(props: { insertPrompt: (text: string) => void }) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<Prompt | null>(null)
  const localPromptsQuery = useSWR('local-prompts', () => loadLocalPrompts(), { suspense: true })

  const savePrompt = useCallback(
    async (prompt: Prompt) => {
      const existed = await saveLocalPrompt(prompt)
      localPromptsQuery.mutate()
      setFormData(null)
      trackEvent(existed ? 'edit_local_prompt' : 'add_local_prompt')
    },
    [localPromptsQuery],
  )

  const removePrompt = useCallback(
    async (id: string) => {
      await removeLocalPrompt(id)
      localPromptsQuery.mutate()
      trackEvent('remove_local_prompt')
    },
    [localPromptsQuery],
  )

  const create = useCallback(() => {
    setFormData({ agentId: uuid(), name: '', prompt: '', botId: 'gemini' })
  }, [])

  return (
    <>
      {localPromptsQuery.data.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
          {localPromptsQuery.data.map((prompt) => (
            <PromptItem
              agentId={prompt.agentId}
              key={prompt.agentId}
              title={prompt.name}
              prompt={prompt.prompt}
              edit={() => !formData && setFormData(prompt)}
              remove={() => removePrompt(prompt.agentId)}
              insertPrompt={props.insertPrompt}
            />
          ))}
        </div>
      ) : (
        <div className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-3 text-center text-sm mt-5 text-primary-text">
          You have no prompts.
        </div>
      )}
      <div className="mt-5">
        {formData ? (
          <PromptForm initialData={formData} onSubmit={savePrompt} onClose={() => setFormData(null)} />
        ) : (
          <Button text={t('Create new prompt')} size="small" onClick={create} />
        )}
      </div>
    </>
  )
}

function CommunityPrompts(props: { insertPrompt: (text: string) => void }) {
  const copyToLocal = useCallback(async (prompt: Prompt) => {
    await saveLocalPrompt({ ...prompt, agentId: uuid() })
  }, [])
  const agentsArray = Object.keys(agents).map((key) => agents[key])
  const { t } = useTranslation()
  const [formData, setFormData] = useState<Prompt | null>(null)
  const localPromptsQuery = useSWR('local-prompts', () => loadLocalPrompts(), { suspense: true })

  const savePrompt = useCallback(
    async (prompt: Prompt) => {
      const existed = await saveLocalPrompt(prompt)
      localPromptsQuery.mutate()
      setFormData(null)
      trackEvent(existed ? 'edit_local_prompt' : 'add_local_prompt')
    },
    [localPromptsQuery],
  )

  const removePrompt = useCallback(
    async (id: string) => {
      await removeLocalPrompt(id)
      localPromptsQuery.mutate()
      trackEvent('remove_local_prompt')
    },
    [localPromptsQuery],
  )

  const create = useCallback(() => {
    setFormData({ agentId: uuid(), name: '', prompt: '', botId: 'gemini' })
  }, [])

  return (
    <>
      {localPromptsQuery.data.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
          {localPromptsQuery.data.map((prompt) => (
            <PromptItem
              agentId={prompt.agentId}
              key={prompt.agentId}
              title={prompt.name}
              prompt={prompt.prompt}
              edit={() => !formData && setFormData(prompt)}
              remove={() => removePrompt(prompt.agentId)}
              insertPrompt={props.insertPrompt}
            />
          ))}
        </div>
      ) : (
        <div className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-3 text-center text-sm mt-5 text-primary-text">
          You have no prompts.
        </div>
      )}
      <div className="mt-5">
        {formData ? (
          <PromptForm initialData={formData} onSubmit={savePrompt} onClose={() => setFormData(null)} />
        ) : (
          <Button text={t('Create new prompt')} size="small" onClick={create} />
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
        {agentsArray.map((prompt) => (
          <PromptItem
            key={prompt.agentId}
            agentId={prompt.agentId}
            title={prompt.name}
            prompt={prompt.prompt}
            insertPrompt={props.insertPrompt}
            copyToLocal={(botId: BotId) => copyToLocal({ ...prompt, botId })}
          />
        ))}
      </div>
      <span className="text-sm mt-5 block text-primary-text">
        Contribute on{' '}
        <a
          href="https://github.com/chathub-dev/community-prompts"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          GitHub
        </a>{' '}
        or{' '}
        <a href="https://openprompt.co/?utm_source=chathub" target="_blank" rel="noreferrer" className="underline">
          OpenPrompt
        </a>
      </span>
    </>
  )
}

const PromptLibrary = (props: { insertPrompt: (text: string) => void }) => {
  const { t } = useTranslation()

  const insertPrompt = useCallback(
    (text: string) => {
      props.insertPrompt(text)
      trackEvent('use_prompt')
    },
    [props],
  )

  return (
    <Suspense fallback={<BeatLoader size={10} className="mt-5" color="rgb(var(--primary-text))" />}>
      <CommunityPrompts insertPrompt={insertPrompt} />
    </Suspense>
  )
}

export default PromptLibrary
