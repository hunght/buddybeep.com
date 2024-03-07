import { Suspense, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BeatLoader } from 'react-spinners'
import useSWR from 'swr'
import { trackEvent } from '~app/plausible'
import { Prompt, loadLocalPrompts, removeLocalPrompt, saveLocalPrompt } from '~services/prompts'
import { uuid } from '~utils'
import Button from '../Button'
import { agents } from '~app/hooks/agents'
import { BotId } from '~app/bots'
import { PromptItem } from './PromptItem'
import { PromptForm } from './PromptForm'

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
