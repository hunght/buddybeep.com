import { supabase } from '~lib/supabase/client'
import { Sentry } from './sentry'

export function setupAuthListener() {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      Sentry.setUser({
        id: session.user.id,
        email: session.user.email,
      })
    } else if (event === 'SIGNED_OUT') {
      Sentry.setUser(null)
    }
  })
}
