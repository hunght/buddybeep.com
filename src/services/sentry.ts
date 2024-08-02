import * as Sentry from '@sentry/react'
import { extraErrorDataIntegration } from '@sentry/integrations'
import { getVersion, isProduction } from '../utils'
import { supabase } from '~lib/supabase/client'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  debug: !isProduction(),
  release: getVersion(),
  integrations: [extraErrorDataIntegration({ depth: 3 })],
  sampleRate: 1.0,
})
