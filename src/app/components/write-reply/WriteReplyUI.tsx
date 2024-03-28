import React, { useMemo } from 'react'

import { useTranslation } from 'react-i18next'
import { RadioGroupView } from './RadioGroup'

import { PrimaryButton } from '../PrimaryButton'
import { createReplyPrompt } from './createReplyPrompt'
import { LanguageWritingSelection } from './LanguageWritingSelection'
import { getLanguagePrompt } from '~app/utils/buildPromptWithLang'
import { useAtom } from 'jotai'
import {
  langAtom,
  formatAtom,
  toneAtom,
  lengthAtom,
  replyContentAtom,
  originalTextAtom,
  formatComposeAtom,
  composeTextAtom,
  subTabAtom,
} from '~app/state/writingAssistantAtom'
import { FormatWritingType } from '~app/types/writing'
import { cx } from '~utils'
import { createComposePrompt } from './createComposePrompt'

export const WriteReplyUI: React.FC<{ onGenerate: (prompt: string) => void }> = ({ onGenerate }) => {
  const { t } = useTranslation()

  const toneOptions = useMemo(
    () => [
      { name: t('Formal'), value: 'formal' },
      { name: t('Casual'), value: 'casual' },
      { name: t('Professional'), value: 'professional' },
      { name: t('Enthusiastic'), value: 'enthusiastic' },
      { name: t('Informational'), value: 'informational' },
      { name: t('Funny'), value: 'funny' },
    ],
    [t],
  )

  const lengthOptions = useMemo(
    () => [
      { name: t('Short'), value: 'short' },
      { name: t('Medium'), value: 'medium' },
      { name: t('Long'), value: 'long' },
    ],
    [t],
  )

  const formatOptions = useMemo<{ name: string; value: FormatWritingType }[]>(
    () => [
      { name: t('Comment'), value: 'comment' },
      { name: t('Email'), value: 'email' },
      { name: t('Message'), value: 'message' },
      { name: t('Twitter'), value: 'twitter' },
    ],
    [t],
  )
  const formatComposeOptions = useMemo(
    () => [
      { name: t('Essay'), value: 'essay' },
      { name: t('Paragraph'), value: 'paragraph' },
      { name: t('Email'), value: 'email' },
      { name: t('Idea'), value: 'idea' },
      { name: t('Blog Post'), value: 'blog_post' },
      { name: t('Outline'), value: 'outline' },
      { name: t('Marketing Ads'), value: 'marketing_ads' },
      { name: t('Comment'), value: 'comment' },
      { name: t('Message'), value: 'message' },
      { name: t('Twitter'), value: 'twitter' },
    ],
    [t],
  )

  const [lang, setLang] = useAtom(langAtom)
  const [format, setFormat] = useAtom(formatAtom)
  const [formatCompose, setFormatCompose] = useAtom(formatComposeAtom)
  const [tone, setTone] = useAtom(toneAtom)
  const [length, setLength] = useAtom(lengthAtom)
  const [replyContent, setReplyContent] = useAtom(replyContentAtom)
  const [originalText, setOriginalText] = useAtom(originalTextAtom)
  const [composeText, setComposeText] = useAtom(composeTextAtom)
  const [tab, setTab] = useAtom(subTabAtom)
  const getDisabled = (): boolean | undefined => {
    if (tab === 'compose') {
      return composeText.length === 0
    }
    return originalText.length === 0 || replyContent.length === 0
  }

  return (
    <div className=" rounded-lg shadow-lg  w-full py-4 px-6 overflow-scroll dark:bg-gray-800">
      <span className="isolate inline-flex rounded-md shadow-sm">
        <button
          type="button"
          onClick={() => {
            setTab('compose')
          }}
          className={cx(
            'relative inline-flex items-center rounded-tl-2xl bg-white px-3 py-2 text-sm font-semibold  text-primary-text ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10',
            tab === 'compose'
              ? 'bg-indigo-600 text-white hover:bg-indigo-500'
              : 'ring-1 ring-inset ring-gray-300 bg-white  dark:text-black text-primary-text hover:bg-gray-50',
          )}
        >
          {t('Compose')}
        </button>
        <button
          onClick={() => {
            setTab('reply')
          }}
          type="button"
          className={cx(
            'relative -ml-px inline-flex items-center  px-3 py-2 text-sm font-semibold  text-primary-text ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 rounded-tr-2xl',
            tab === 'reply'
              ? 'bg-indigo-600 text-primary-text hover:bg-indigo-500'
              : 'ring-1 ring-inset ring-gray-300 bg-white  text-primary-text dark:text-black hover:bg-gray-50',
          )}
        >
          {t('Reply')}
        </button>
      </span>

      <div className="mb-4  border-b"></div>

      {tab === 'reply' ? (
        <div className="mb-4">
          <label className="block  text-primary-text text-sm font-bold mb-2" htmlFor="original-text">
            {t('The original text to which you want to reply')}
          </label>
          <textarea
            id="original-text"
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder='For example, "I am writing to you to express my dissatisfaction with the service I received from your company."'
            className="shadow appearance-none border rounded w-full py-2 px-3  text-primary-text  dark:text-black leading-tight focus:outline-none focus:shadow-outline h-36"
          ></textarea>
        </div>
      ) : (
        <div className="mb-4">
          <label className="block text-primary-text text-sm font-bold mb-2" htmlFor="original-text">
            {t('The topic you want to compose')}
          </label>
          <textarea
            id="original-text"
            value={composeText}
            onChange={(e) => setComposeText(e.target.value)}
            placeholder='For example, "The impact of climate change on the economy."'
            className="shadow appearance-none border rounded w-full py-2 px-3  text-primary-text dark:text-black leading-tight focus:outline-none focus:shadow-outline h-36"
          ></textarea>
        </div>
      )}

      {tab === 'reply' && (
        <div className="mb-4">
          <label className="block  text-primary-text text-sm font-bold mb-2" htmlFor="reply-content">
            {t('The general content of your reply to the above text')}
          </label>
          <textarea
            id="reply-content"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder='Press Enter to generate draft suggestions based on the content you write. For example, "I am sorry to hear that you are dissatisfied with our service. We strive to provide the best service possible and we are sorry that we did not meet your expectations."'
            className="shadow appearance-none border rounded w-full py-2 px-3  text-primary-text dark:text-black mb-3 leading-tight focus:outline-none focus:shadow-outline h-44"
          ></textarea>
        </div>
      )}

      {tab === 'reply' ? (
        <div className="mb-4  ">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium leading-6  text-primary-text">{t('Format')}</h2>
          </div>
          <RadioGroupView options={formatOptions} value={format} onChange={(value) => setFormat(value)} />
        </div>
      ) : (
        <div className="mb-4  ">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium leading-6  text-primary-text">{t('Format')}</h2>
          </div>
          <RadioGroupView
            options={formatComposeOptions}
            value={formatCompose}
            onChange={(value) => setFormatCompose(value)}
          />
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium leading-6  text-primary-text">{t('Tone')}</h2>
        </div>
        <RadioGroupView options={toneOptions} value={tone} onChange={setTone} />
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium leading-6  text-primary-text">{t('Length')}</h2>
        </div>
        <RadioGroupView options={lengthOptions} value={length} onChange={setLength} />
      </div>
      <div className="mb-4"></div>

      <div className="flex justify-center flex-row items-center gap-2">
        <div className="w-32">
          <LanguageWritingSelection lang={lang} onLanguageChange={setLang} />
        </div>
        <PrimaryButton
          title={t('Generate draft')}
          disabled={getDisabled()}
          onClick={() => {
            if (tab === 'compose') {
              const prompt = createComposePrompt({
                topic: composeText,
                tone: tone,
                length: length,
                format: formatCompose,
                language: getLanguagePrompt(lang) ?? 'English',
              })
              onGenerate(prompt)
              return
            }
            const prompt = createReplyPrompt({
              originalText,
              replyContent,
              tone: tone,
              length: length,
              format: format,
              language: getLanguagePrompt(lang) ?? 'English',
            })
            onGenerate(prompt)
          }}
        />
      </div>
    </div>
  )
}
