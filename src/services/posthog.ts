import posthog from 'posthog-js'

export const initPostHog = () => {
  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
      api_host: import.meta.env.VITE_POSTHOG_HOST,
      persistence: 'localStorage',
      autocapture: false,
      disable_session_recording: true,
      capture_pageview: false,
      disable_persistence: !import.meta.env.PROD,
    })
  }
}

export const trackEvent = (name: string, properties?: Record<string, any>) => {
  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.capture(name, properties)
  }
}

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.identify(userId, properties)
  }
}

export const resetUser = () => {
  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.reset()
  }
}
