import { Link } from '@tanstack/react-router'
import { cx } from '~/utils'
import { AgentType } from '~app/types/agent'

function NavLink(props: { botId: string; agent: AgentType | null; iconOnly?: boolean }) {
  const { botId, agent, iconOnly } = props

  if (!agent) {
    return null
  }
  return (
    <Link
      className={cx(
        'rounded-[10px] w-full pl-3 flex flex-row gap-3 items-center shrink-0 py-[11px]',
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
      <img src={agent.avatar ?? ''} className="w-5 h-5" />
      {<span className="font-medium text-sm">{iconOnly ? '' : agent.name}</span>}
    </Link>
  )
}

export default NavLink
