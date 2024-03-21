import React, { useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { RadioGroupView } from './RadioGroup'
import { OptionType } from './type'
import { LanguageWritingSelection } from './LanguageWritingSelection'

export const WriteReplyUI = () => {
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

  const formatOptions = useMemo(
    () => [
      { name: t('Comment'), value: 'comment' },
      { name: t('Email'), value: 'email' },
      { name: t('Message'), value: 'message' },
      { name: t('Twitter'), value: 'twitter' },
    ],
    [t],
  )

  const [format, setFormat] = useState<OptionType>(formatOptions[0])
  const [tone, setTone] = useState<OptionType>(toneOptions[0])
  const [length, setLength] = useState<OptionType>(lengthOptions[0])

  return (
    <div className="bg-secondary rounded-lg shadow-lg  w-full py-4 px-6">
      <div className="mb-4">
        <h2 className="text-lg text-gray-900 font-semibold">Write</h2>
        <div className="tabs flex justify-between border-b">
          <div className="tab">Compose</div>
          <div className="tab">Reply</div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="original-text">
          The original text to which you want to reply
        </label>
        <textarea
          id="original-text"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        ></textarea>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reply-content">
          The general content of your reply to the above text
        </label>
        <textarea
          id="reply-content"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
        ></textarea>
      </div>

      <div className="mb-4  ">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium leading-6 text-gray-900">Format</h2>
        </div>
        <RadioGroupView options={formatOptions} value={format} onChange={setFormat} />
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium leading-6 text-gray-900">Tone</h2>
        </div>
        <RadioGroupView options={toneOptions} value={tone} onChange={setTone} />
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium leading-6 text-gray-900">Length</h2>
        </div>
        <RadioGroupView options={lengthOptions} value={length} onChange={setLength} />
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium leading-6 text-gray-900">Language</h2>
        </div>
        <div className="w-40">
          <LanguageWritingSelection />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Generate draft
        </button>
      </div>
    </div>
  )
}
