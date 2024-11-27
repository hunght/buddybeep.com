import { trackEventSentry } from '~services/sentry'

export function trackEvent(name: string, props?: { [propName: string]: string | number | boolean | undefined }) {
  trackEventSentry('plausible', name, props)
}
