import { trackEvent as trackPostHogEvent } from '~/services/posthog'

export function trackEvent(name: string, props?: Record<string, string | number | boolean>) {
  // Track event in PostHog
  trackPostHogEvent(name, props)
}
