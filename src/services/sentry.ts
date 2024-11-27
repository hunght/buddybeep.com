import {
  BrowserClient,
  browserProfilingIntegration,
  browserTracingIntegration,
  defaultStackParser,
  getDefaultIntegrations,
  makeFetchTransport,
  Scope,
} from '@sentry/browser'
import logger from '~utils/logger'

// filter integrations that use the global variable
const integrations = getDefaultIntegrations({}).filter((defaultIntegration) => {
  return !['BrowserApiErrors', 'Breadcrumbs', 'GlobalHandlers'].includes(defaultIntegration.name)
})

const client = new BrowserClient({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  transport: makeFetchTransport,
  stackParser: defaultStackParser,
  integrations: [...integrations, browserTracingIntegration(), browserProfilingIntegration()],

  // Tracing
  tracesSampleRate: 1.0,
  tracePropagationTargets: ['localhost', /^https:\/\/buddybeep\.com\/api/],
  profilesSampleRate: 1.0,

  // Enhanced tracking
  maxBreadcrumbs: 50,
  attachStacktrace: true,
  environment: import.meta.env.MODE || 'development',
})

const scope = new Scope()
scope.setClient(client)

// Main tracking function to replace Plausible's trackEvent
export function trackEventSentry(
  category: string,
  action: string,
  data?: Record<string, string | number | boolean | undefined>,
) {
  try {
    scope.addBreadcrumb({
      category,
      message: action,
      level: 'info',
      type: 'user',
      data: data ? Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined)) : undefined,
    })
  } catch (err) {
    logger.error('sentry.trackEvent error', err)
  }
}

client.init()
export { scope as Sentry }
