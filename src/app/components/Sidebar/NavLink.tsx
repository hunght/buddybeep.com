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
        'rounded-[10px] w-full pl-2 flex flex-row gap-2 items-center shrink-0 py-2 ',
        iconOnly && 'justify-center',
      )}
      activeOptions={{ exact: true }}
      activeProps={{ className: 'bg-white text-primary-text dark:bg-primary-blue' }}
      inactiveProps={{
        className:
          'bg-secondary bg-opacity-20 text-primary-text hover:bg-opacity-80 dark:bg-opacity-30 dark:text-primary-text dark:hover:bg-opacity-80',
      }}
      title={agent ? agent.name : botId}
      params={{ botId, agentId: agent ? agent.agentId : undefined }}
      to={agent ? '/chat-agent/$agentId/$botId' : '/chat/$botId'}
    >
      {renderIcon()}

      <div className="w-full">
        <span className="font-medium text-sm w-full line-clamp-1">{iconOnly ? '' : title}</span>
        {props.lastMessage ? (
          <div className="flex flex-row w-full pr-1 text-secondary-text">
            <span className="text-sm w-full line-clamp-1">{iconOnly ? '' : props.lastMessage.text}</span>
            <span className="text-sm  text-right">{iconOnly ? '' : formatTimestamp(props.lastMessage.time)}</span>
          </div>
        ) : (
          <span> ... </span>
        )}
      </div>
    </Link>
  )

  function renderIcon() {
    if (agentIcon) {
      return (
        <div>
          <div className="w-10 h-10 text-2xl text-center items-center justify-center bg-secondary flex rounded-full">
            {agentIcon}
          </div>
        </div>
      )
    }
    return agent ? (
      <div>
        {agent.avatar ? (
          <img src={agent.avatar} className="w-10 h-10" />
        ) : (
          <div className="w-10 h-10 bg-secondary rounded-full flex justify-center items-center">
            <span className="text-primary-text text-lg font-bold">{agent.name.slice(0, 2)}</span>
          </div>
        )}
      </div>
    ) : (
      <img src={icon} className="w-10 h-10 bg-secondary rounded-full flex justify-center items-center p-1" />
    )
  }
}

export default NavLink
