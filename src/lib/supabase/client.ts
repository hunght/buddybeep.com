import { createClient } from '@supabase/supabase-js'
import { identifyUser, resetUser } from '~/services/posthog'
import { Database } from './schema'

const supabaseUrl = import.meta.env.VITE_REACT_APP_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_REACT_APP_ANON_KEY as string

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    identifyUser(session.user.id, {
      email: session.user.email,
    })
  } else if (event === 'SIGNED_OUT') {
    resetUser()
  }
})

export default supabase
