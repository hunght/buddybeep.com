import { createHashHistory, createRoute, useParams, createRouter, createRootRoute } from '@tanstack/react-router'
import { BotId } from './bots'
import Layout from './components/Layout'
import MultiBotChatPanel from './pages/MultiBotChatPanel'
import PremiumPage from './pages/PremiumPage'
import SettingPage from './pages/SettingPage'
import SingleBotChatPanel from './pages/SingleBotChatPanel'

const rootRoute = createRootRoute()

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  component: Layout,
  id: 'layout',
})

const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: MultiBotChatPanel,
})

function ChatRoute() {
  const { botId } = useParams({ from: chatRoute.id })

  return <SingleBotChatPanel botId={botId as BotId} agentId={null} />
}

function AgentChatRoute() {
  const { botId, agentId } = useParams({ from: agentchatRoute.id })

  return <SingleBotChatPanel botId={botId as BotId} agentId={agentId} />
}

const agentchatRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'chat-agent/$agentId/$botId',
  component: AgentChatRoute,
})

const chatRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'chat/$botId',
  component: ChatRoute,
})

const settingRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'setting',
  component: SettingPage,
})

export const premiumRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'premium',
  component: PremiumPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      source: search.source as string | undefined,
    }
  },
})

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([indexRoute, agentchatRoute, chatRoute, settingRoute, premiumRoute]),
])

const hashHistory = createHashHistory()
const router = createRouter({ routeTree, history: hashHistory })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export { router }
