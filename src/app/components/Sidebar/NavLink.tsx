import { Link } from '@tanstack/react-router'
import { capitalize } from 'lodash-es'
import { cx } from '~/utils'
import { AgentType } from '~app/types/agent'
import { LastMessageType } from '~app/types/chatState'
import { formatTimestamp } from '~app/utils/time'
import { agentIcons } from '../AgentIcons'

function NavLink(props: {
  botId: string
  agent?: AgentType
  iconOnly?: boolean
  lastMessage: LastMessageType
  icon?: string
  botName?: string
}) {
  const { botId, agent, iconOnly, icon, botName } = props

  const title = agent ? `${agent.name} - ${capitalize(botId)}` : botName

  const agentIcon = agentIcons[agent?.agentId ?? '']

  if (!title) {
    return null
  }
  return (
    <Link
      className={cx(
        'rounded-[10px] w-full pl-2 flex flex-row gap-3 items-center shrink-0 py-3 transition-all duration-200',
        iconOnly && 'justify-center',
      )}
      activeOptions={{ exact: true }}
      activeProps={{ className: 'text-primary-blue dark:bg-secondary shadow-md' }}
      inactiveProps={{
        className:
          'bg-secondary bg-opacity-20 text-primary-text hover:bg-opacity-80 hover:text-primary-blue dark:bg-opacity-30 dark:text-primary-text dark:hover:bg-opacity-80 hover:shadow-sm',
      }}
      title={agent ? agent.name : botId}
      params={{ botId, agentId: agent ? agent.agentId : undefined }}
      to={agent ? '/chat-agent/$agentId/$botId' : '/chat/$botId'}
    >
      {renderIcon()}

      {!iconOnly && (
        <div className="w-full overflow-hidden">
          <span className="font-medium text-base w-full line-clamp-1">{title}</span>
          {props.lastMessage ? (
            <div className="flex flex-row w-full pr-1 text-sm text-opacity-70">
              <span className="w-full line-clamp-1">{props.lastMessage.text}</span>
              <span className="ml-2 whitespace-nowrap">{formatTimestamp(props.lastMessage.time)}</span>
            </div>
          ) : (
            <span className="text-sm text-opacity-50">No messages yet</span>
          )}
        </div>
      )}
    </Link>
  )

  function renderIcon() {
    const iconClass = 'w-10 h-10 text-2xl flex items-center justify-center rounded-full overflow-hidden'
    if (agentIcon) {
      return (
        <div className={iconClass}>
          <div className="bg-secondary flex rounded-full">{agentIcon}</div>
        </div>
      )
    }
    return agent ? (
      <div className={iconClass}>
        {agent.avatar ? (
          <img src={agent.avatar} className="w-full h-full" />
        ) : (
          <div className="bg-secondary rounded-full flex justify-center items-center">
            <span className="text-primary-text text-lg font-bold">{agent.name.slice(0, 2)}</span>
          </div>
        )}
      </div>
    ) : (
      <div className={iconClass}>
        <img src={icon} className="w-full h-full bg-secondary rounded-full flex justify-center items-center p-1" />
      </div>
    )
  }
}

export default NavLink
