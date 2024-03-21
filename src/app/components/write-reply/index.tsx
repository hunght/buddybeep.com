import React, { useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { RadioGroupView } from './RadioGroup'
import { OptionType } from './type'

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
  const [replyContent, setReplyContent] = useState<string>('')
  const [originalText, setOriginalText] = useState<string>('')

  return (
    <div className=" rounded-lg shadow-lg  w-full py-4 px-6">
      <div className="mb-4">
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
          value={originalText}
          onChange={(e) => setOriginalText(e.target.value)}
          placeholder='For example, "I am writing to you to express my dissatisfaction with the service I received from your company."'
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-36"
        ></textarea>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reply-content">
          The general content of your reply to the above text
        </label>
        <textarea
          id="reply-content"
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder='Press Enter to generate draft suggestions based on the content you write. For example, "I am sorry to hear that you are dissatisfied with our service. We strive to provide the best service possible and we are sorry that we did not meet your expectations."'
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline h-44"
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

      <div className="flex justify-center">
        <button
          type="button"
          className="rounded-md bg-indigo-600 py-2 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 px-10"
          disabled={originalText.length === 0 || replyContent.length === 0}
        >
          Generate draft
        </button>
      </div>
    </div>
  )
}
