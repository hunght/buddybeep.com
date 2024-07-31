import { FC, useRef, useEffect } from 'react'
import { cx } from '~/utils'
import { BotId } from '~app/bots'
import { ChatMessageModel } from '~types'
import ChatMessageCard from './ChatMessageCard'
import { NoMessage } from './NoMessage'

interface Props {
  botId: BotId
  messages: ChatMessageModel[]
  className?: string
  avatar: string | null | React.ReactElement
  onClick: (prompt: string) => void
}

const ChatMessageList: FC<Props> = (props) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [props.messages])

  return (
    <div className={cx('overflow-auto h-full', props.className)}>
      <div className="flex flex-col gap-3 h-full">
        {props.messages.map((message, index) => (
          <ChatMessageCard
            avatar={props.avatar}
            key={message.id}
            message={message}
            className={index === 0 ? 'mt-5' : undefined}
          />
        ))}
        {props.messages.length === 0 && <NoMessage onClick={props.onClick} />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

export default ChatMessageList
