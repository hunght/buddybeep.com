import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import supabase from '~lib/supabase/client'
import { getSession } from '~lib/supabase/service'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    getSession().then((session) => {
      if (session) {
        supabase.auth.setSession(session)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
