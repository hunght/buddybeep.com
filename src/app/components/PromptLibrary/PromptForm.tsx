import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Prompt } from '~services/prompts'
import Button from '../Button'
import { Input, Textarea } from '../Input'
import { BotId } from '~app/bots'

export function PromptForm(props: { initialData: Prompt; onSubmit: (data: Prompt) => void; onClose: () => void }) {
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
