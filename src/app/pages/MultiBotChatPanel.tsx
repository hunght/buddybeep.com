import { FC, useCallback, useMemo } from 'react'
import Button from '~app/components/Button'
import ChatMessageInput from '~app/components/Chat/ChatMessageInput'
import { useChat } from '~app/hooks/use-chat'
import { BotId } from '../bots'
import ConversationPanel from '../components/Chat/ConversationPanel'

const MultiBotChatPanel: FC = () => {
  const chatgptChat = useChat('chatgpt')
  const bingChat = useChat('bing')

  const generating = useMemo(
    () => chatgptChat.generating || bingChat.generating,
    [bingChat.generating, chatgptChat.generating],
  )

  const onUserSendMessage = useCallback(
    (input: string, botId?: BotId) => {
      if (botId === 'chatgpt') {
        chatgptChat.sendMessage(input)
      } else if (botId === 'bing') {
        bingChat.sendMessage(input)
      } else {
        chatgptChat.sendMessage(input)
        bingChat.sendMessage(input)
      }
    },
    [bingChat, chatgptChat],
  )

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="grid grid-cols-2 gap-5 overflow-hidden grow">
        <ConversationPanel
          botId="chatgpt"
          messages={chatgptChat.messages}
          onUserSendMessage={onUserSendMessage}
          generating={chatgptChat.generating}
          stopGenerating={chatgptChat.stopGenerating}
          mode="compact"
          resetConversation={chatgptChat.resetConversation}
        />
        <ConversationPanel
          botId="bing"
          messages={bingChat.messages}
          onUserSendMessage={onUserSendMessage}
          generating={bingChat.generating}
          stopGenerating={bingChat.stopGenerating}
          mode="compact"
          resetConversation={bingChat.resetConversation}
        />
      </div>
      <ChatMessageInput
        mode="full"
        className="rounded-full bg-white px-[20px] py-[10px] mt-5"
        disabled={generating}
        placeholder="Send to all ..."
        onSubmit={onUserSendMessage}
        actionButton={!generating && <Button text="Send" color="primary" type="submit" />}
        autoFocus={true}
      />
    </div>
  )
}

export default MultiBotChatPanel
