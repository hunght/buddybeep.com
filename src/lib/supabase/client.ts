import { createClient } from '@supabase/supabase-js'
import { Database } from './schema'
import { Sentry } from '~services/sentry'

const supabaseUrl = import.meta.env.VITE_REACT_APP_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_REACT_APP_ANON_KEY as string

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

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

export default supabase
