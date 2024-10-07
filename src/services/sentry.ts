import { BrowserClient, defaultStackParser, getDefaultIntegrations, makeFetchTransport, Scope } from '@sentry/browser'

// filter integrations that use the global variable
const integrations = getDefaultIntegrations({}).filter((defaultIntegration) => {
  return !['BrowserApiErrors', 'Breadcrumbs', 'GlobalHandlers'].includes(defaultIntegration.name)
})

const client = new BrowserClient({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  transport: makeFetchTransport,
  stackParser: defaultStackParser,
  integrations: integrations,
})

const scope = new Scope()
scope.setClient(client)

client.init() // initializing has to be done after setting the client on the scope
export { scope as Sentry }
