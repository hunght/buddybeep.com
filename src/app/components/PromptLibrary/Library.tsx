import { Suspense, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BeatLoader } from 'react-spinners'
import useSWR from 'swr'
import { trackEvent } from '~app/plausible'
import { Prompt } from '~services/prompts'
import { uuid } from '~utils'
import Button from '../Button'

import { BotId } from '~app/bots'
import { PromptItem } from './PromptItem'
import { PromptForm } from './PromptForm'
import Sidebar from './Sidebar'
import { agentsByCategoryAtom, categoryAtom, promptLibraryAtom } from '~app/state/agentAtom'
import { useAtom, useAtomValue } from 'jotai'
import { SearchInput } from './SearchInput'
import { getAllAgentsAtom } from '~app/state/agentAtom'
import supabase from '~lib/supabase/client'
import { useUser } from '~hooks/useUser'
import { Database } from '~lib/supabase/schema'
import { MyPromptItem } from './MyPromptItem'
type PromptDB = Database['public']['Tables']['prompts']['Row']

function CommunityPrompts(props: {
  insertPrompt: ({ botId, agentId }: { botId: BotId; agentId: string | null }) => void
}) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<Prompt | null>(null)
  const { user, loading: userLoading } = useUser()
  const [, setPromptLibrary] = useAtom(promptLibraryAtom)
  // Use SWR to fetch user prompts
  const { data: userPrompts, mutate } = useSWR<PromptDB[]>(user ? 'user-prompts' : null, async () => {
    const { data } = await supabase
      .from('prompts')
      .select('*')
      .eq('user_id', user?.id ?? '')
    if (data) {
      setPromptLibrary(
        Object.fromEntries(
          data.map((prompt) => [
            prompt.id,
            { agentId: prompt.id, name: prompt.name, prompt: prompt.prompt, avatar: null },
          ]),
        ),
      )
    }
    return data ?? []
  })

  const clonePrompt = useCallback(
    async ({ name, prompt, botId }: { name: string; prompt: string; botId: string }) => {
      if (user) {
        try {
          await supabase.from('prompts').insert({ name, prompt, user_id: user.id, bot_id: botId })
          mutate() // Trigger a re-fetch of user prompts
          setFormData(null)
          trackEvent('save_custom_prompt')
        } catch (error) {
          console.error('Error saving user prompt:', error)
        }
      }
    },
    [user, mutate],
  )
  const editPrompt = useCallback(
    async (id: string, name: string, prompt: string) => {
      await supabase.from('prompts').update({ name, prompt }).eq('id', id)
      mutate()
    },
    [mutate],
  )

  const removePrompt = useCallback(
    async (id: string) => {
      if (user) {
        try {
          await supabase.from('prompts').delete().eq('id', id)
          mutate() // Trigger a re-fetch of user prompts
          trackEvent('remove_custom_prompt')
        } catch (error) {
          console.error('Error removing user prompt:', error)
        }
      }
    },
    [user, mutate],
  )

  const create = useCallback(() => {
    setFormData({ agentId: uuid(), name: '', prompt: '', botId: 'gemini' })
  }, [])

  const agentsArray = useAtomValue(agentsByCategoryAtom)
  const [category, setCategory] = useAtom(categoryAtom)
  const allAgents = useAtomValue(getAllAgentsAtom)

  if (category.category === 'My Prompts') {
    return (
      <div>
        <h2 className="text-2xl font-bold text-primary-text mb-3">{t('My Prompts')}</h2>
        {!userLoading && (
          <>
            {user ? (
              <>
                {!userPrompts ? (
                  <BeatLoader size={10} color="rgb(var(--primary-text))" />
                ) : userPrompts.length ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                    {userPrompts.map((prompt) => (
                      <MyPromptItem
                        key={prompt.id}
                        id={prompt.id}
                        title={prompt.name ?? ''}
                        prompt={prompt.prompt ?? ''}
                        insertPrompt={props.insertPrompt}
                        clonePrompt={(botId: BotId) =>
                          clonePrompt({ name: prompt.name ?? '', prompt: prompt.prompt ?? '', botId })
                        }
                        remove={() => removePrompt(prompt.id)}
                        edit={editPrompt}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-3 text-center text-sm mt-5 text-primary-text">
                    You have no custom prompts.
                  </div>
                )}
                <div className="mt-5">
                  {formData ? (
                    <PromptForm initialData={formData} onSubmit={clonePrompt} onClose={() => setFormData(null)} />
                  ) : (
                    <Button text={t('Create new prompt')} size="small" onClick={create} />
                  )}
                </div>
              </>
            ) : (
              <div className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-3 text-center text-sm mt-5 text-primary-text">
                <p>Login to create and manage custom prompts.</p>
                <Button
                  text={t('Login')}
                  size="small"
                  onClick={async () => {
                    console.log('clicked')
                    const response = await chrome.runtime.sendMessage({ action: 'getSession' })
                    console.log(response)
                    await supabase.auth.setSession(response)
                  }}
                  className="mt-3"
                />
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  if (category.category !== null || category.subcategory !== null) {
    return (
      <div>
        <div className="flex flex-row justify-between">
          <div className="flex flex-row text-2xl ">
            <h2
              className="font-bold text-primary-text mb-3 hover:text-blue-500 cursor-pointer"
              onClick={() => {
                setCategory({ category: null, subcategory: null })
              }}
            >
              {t('All')}
            </h2>
            {category.category && (
              <>
                <h2 className="font-bold text-secondary-text px-4 ">{'/'}</h2>
                <h2
                  className="font-bold text-primary-text mb-3 hover:text-blue-500 cursor-pointer"
                  onClick={() => {
                    setCategory({ category: category.category, subcategory: null })
                  }}
                >
                  {t(category.category)}
                </h2>
              </>
            )}
            {category.subcategory && (
              <>
                <h2 className="font-bold text-secondary-text px-4">{'/'}</h2>
                <h2 className="font-bold text-primary-text mb-3 ">{t(category.subcategory)}</h2>
              </>
            )}
          </div>
          {/* search bar */}

          <SearchInput />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
          {agentsArray.map((prompt) => (
            <PromptItem
              key={prompt.agentId}
              agent={allAgents[prompt.agentId]}
              title={prompt.name}
              prompt={prompt.prompt}
              insertPrompt={props.insertPrompt}
              clonePrompt={async (botId: BotId) => {
                await clonePrompt({ ...prompt, botId })
                setCategory({ category: 'My Prompts', subcategory: null })
              }}
            />
          ))}
        </div>
      </div>
    )
  }
  return (
    <>
      <div className="flex flex-row justify-between">
        <h2 className="text-2xl font-bold text-primary-text mb-3">{t('All')}</h2>
        <SearchInput />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
        {agentsArray.map((prompt) => (
          <PromptItem
            key={prompt.agentId}
            agent={allAgents[prompt.agentId]}
            title={prompt.name}
            prompt={prompt.prompt}
            insertPrompt={props.insertPrompt}
            clonePrompt={(botId: BotId) => {
              clonePrompt({ name: prompt.name ?? '', prompt: prompt.prompt ?? '', botId })
            }}
          />
        ))}
      </div>
      <span className="text-sm mt-5 block text-primary-text">
        Contribute on{' '}
        <a
          href="https://github.com/buddybeep-dev/community-prompts"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          GitHub
        </a>{' '}
        or{' '}
        <a href="https://openprompt.co/?utm_source=buddybeep" target="_blank" rel="noreferrer" className="underline">
          OpenPrompt
        </a>
      </span>
    </>
  )
}

const PromptLibrary = (props: {
  insertPrompt: ({ botId, agentId }: { botId: BotId; agentId: string | null }) => void
}) => {
  const insertPrompt = useCallback(
    ({ botId, agentId }: { botId: BotId; agentId: string | null }) => {
      props.insertPrompt({ botId, agentId })
      trackEvent('use_prompt')
    },
    [props],
  )

  return (
    <Suspense fallback={<BeatLoader size={10} className="mt-5 " color="rgb(var(--primary-text))" />}>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-grow p-5">
          <CommunityPrompts insertPrompt={insertPrompt} />
        </div>
      </div>
    </Suspense>
  )
}

export default PromptLibrary
