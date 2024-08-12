import * as Sentry from '@sentry/react'
import { getVersion, isProduction } from '../utils'
import { supabase } from '~lib/supabase/client'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  debug: !isProduction(),
  release: getVersion(),
  integrations: [Sentry.extraErrorDataIntegration({ depth: 3 })],
  sampleRate: 1.0,
})

export async function configureSentryUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session?.user) {
    Sentry.setUser({
      id: session.user.id,
      email: session.user.email,
    })
  } else {
    Sentry.setUser(null) // Clear user data if not logged in
  }
}

export { Sentry }
