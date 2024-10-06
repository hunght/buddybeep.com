import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import supabase from '~lib/supabase/client'

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

async function getSession() {
  const storedSession = await chrome.storage.local.get('supabaseSession')
  if (storedSession.supabaseSession) {
    // Set the stored session
    await supabase.auth.setSession(storedSession.supabaseSession)
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session) {
    await chrome.storage.local.set({ supabaseSession: session })
    return session
  }
}
