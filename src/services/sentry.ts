import { BrowserClient, browserProfilingIntegration, browserTracingIntegration, defaultStackParser, getDefaultIntegrations, makeFetchTransport, Scope } from '@sentry/browser'

// filter integrations that use the global variable
const integrations = getDefaultIntegrations({}).filter((defaultIntegration) => {
  return !['BrowserApiErrors', 'Breadcrumbs', 'GlobalHandlers'].includes(defaultIntegration.name)
})

const client = new BrowserClient({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  transport: makeFetchTransport,
  stackParser: defaultStackParser,
  integrations:  [...integrations,
    browserTracingIntegration(),
    browserProfilingIntegration(),
  ],
 
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/buddybeep\.com\/api/],
  // Set profilesSampleRate to 1.0 to profile every transaction.
  // Since profilesSampleRate is relative to tracesSampleRate,
  // the final profiling rate can be computed as tracesSampleRate * profilesSampleRate
  // For example, a tracesSampleRate of 0.5 and profilesSampleRate of 0.5 would
  // results in 25% of transactions being profiled (0.5*0.5=0.25)
  profilesSampleRate: 1.0,
})

const scope = new Scope()
scope.setClient(client)

client.init() // initializing has to be done after setting the client on the scope
export { scope as Sentry }
