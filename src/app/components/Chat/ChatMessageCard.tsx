import { cx } from '~/utils'
import { FC, memo, useEffect, useMemo, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { IoCheckmarkSharp, IoCopyOutline } from 'react-icons/io5'
import { BeatLoader } from 'react-spinners'
import { ChatMessageModel } from '~/types'
import Markdown from '../Markdown'
import ErrorAction from './ErrorAction'
import MessageBubble from './MessageBubble'

import logger from '~utils/logger'

const COPY_ICON_CLASS = 'self-top cursor-pointer invisible group-hover:visible mt-[12px] text-primary-text'

interface Props {
  message: ChatMessageModel
  className?: string
  avatar: string | null | React.ReactElement
}

const ChatMessageCard: FC<Props> = ({ message, className, avatar }) => {
  const [copied, setCopied] = useState(false)

  const imageUrl = useMemo(() => {
    try {
      return message.image ? URL.createObjectURL(message.image) : ''
    } catch (error) {
      logger.warn('[Failed to create object URL for image]', error)
      return ''
    }
  }, [message.image])

  const copyText = useMemo(() => {
    if (message.text) {
      return message.text
    }
    if (message.error) {
      return message.error.message
    }
  }, [message.error, message.text])

  useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 1000)
    }
  }, [copied])

  return (
    <div
      className={cx('group flex gap-3 w-full', message.author === 'user' ? 'flex-row-reverse' : 'flex-row', className)}
    >
      {renderIcon()}
      <div className="flex flex-col w-11/12  max-w-fit items-start gap-2">
        <MessageBubble color={message.author === 'user' ? 'primary' : 'flat'}>
          {!!imageUrl && <img src={imageUrl} className="max-w-xs my-2" />}
          {message.text ? (
            <Markdown>{message.text}</Markdown>
          ) : (
            !message.error &&
            (message?.text?.length === 0 ? (
              <Markdown>{'...'}</Markdown>
            ) : (
              <BeatLoader size={10} className="leading-tight" color="rgb(var(--primary-text))" />
            ))
          )}
          {!!message.error && <p className="text-[#cc0000] dark:text-[#ff0033]">{message.error.message}</p>}
        </MessageBubble>
        {!!message.error && <ErrorAction error={message.error} />}
      </div>
      {!!copyText && (
        <CopyToClipboard text={copyText} onCopy={() => setCopied(true)}>
          {copied ? <IoCheckmarkSharp className={COPY_ICON_CLASS} /> : <IoCopyOutline className={COPY_ICON_CLASS} />}
        </CopyToClipboard>
      )}
    </div>
  )

  function renderIcon() {
    if (message.author === 'user') {
      return
    }

    if (typeof avatar === 'string')
      return avatar && avatar.length === 2 ? (
        <div className="w-10 h-10 bg-secondary rounded-full flex justify-center items-center">
          <span className="text-primary-text text-lg font-bold">{avatar}</span>
        </div>
      ) : (
        <img src={avatar ?? ''} alt="Avatar" className="w-10 h-10 rounded-full" />
      )
    if (avatar) {
      return (
        <div className="w-10 h-10 text-2xl text-center items-center justify-center bg-secondary flex rounded-full">
          {avatar}
        </div>
      )
    }
  }
}

export default memo(ChatMessageCard)
