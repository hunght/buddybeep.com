import { FC } from 'react'
import { useChat } from '~app/hooks/use-chat'
import { BotId } from '../bots'
import ConversationPanel from '../components/Chat/ConversationPanel'

interface Props {
  botId: BotId
  agentId?: string
}

const SingleBotChatPanel: FC<Props> = ({ botId, agentId }) => {
  const chat = useChat(botId)
  console.log(`==== agentId ===`)
  console.log(agentId)
  console.log('==== end log ===')
  return (
    <div className="overflow-hidden h-full">
      <ConversationPanel
        botId={botId}
        bot={chat.bot}
        messages={chat.messages}
        onUserSendMessage={chat.sendMessage}
        generating={chat.generating}
        stopGenerating={chat.stopGenerating}
        resetConversation={chat.resetConversation}
      />
    </div>
  )
}

export default SingleBotChatPanel
