import { Link } from '@tanstack/react-router'
import { capitalize } from 'lodash-es'
import { cx } from '~/utils'
import { AgentType } from '~app/types/agent'

function NavLink(props: { botId: string; agent?: AgentType; iconOnly?: boolean }) {
  const { botId, agent, iconOnly } = props

  if (!agent) {
    return null
  }
  return (
    <Link
      className={cx(
        'rounded-[10px] w-full pl-1 flex flex-row gap-2 items-center shrink-0 py-1',
        iconOnly && 'justify-center',
      )}
      activeOptions={{ exact: true }}
      activeProps={{ className: 'bg-white text-primary-text dark:bg-primary-blue' }}
      inactiveProps={{
        className: 'bg-secondary bg-opacity-20 text-primary-text opacity-80 hover:opacity-100',
      }}
      title={agent.name}
      params={{ botId, agentId: agent.agentId ?? '' }}
      to="/chat-agent/$agentId/$botId"
    >
      <div>
        {agent.avatar ? (
          <img src={agent.avatar} className="w-10 h-10" />
        ) : (
          <div className="w-10 h-10 bg-gray-300 rounded-full flex justify-center items-center">
            <span className="text-primary-text text-lg font-bold">{agent.name.slice(0, 2)}</span>
          </div>
        )}
      </div>
      {<span className="font-medium text-sm w-full">{iconOnly ? '' : agent.name + '-' + capitalize(botId)}</span>}
    </Link>
  )
}

export default NavLink
