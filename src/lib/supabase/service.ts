import { Session } from '@supabase/supabase-js'
import supabase from './client'

function launchWebAuthFlow(url: string, interactive: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow({ url, interactive }, async (redirectedTo) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve(redirectedTo)
      }
    })
  })
}

export const getUserId = async (): Promise<string | undefined> => {
  const session = await getSession()
  return session?.user.id
}

export const getSession = async (): Promise<Session | null> => {
  // Check if we have a stored session
  const storedSession = await chrome.storage.local.get('supabaseSession')
  if (storedSession.supabaseSession) {
    // Set the stored session
    await supabase.auth.setSession(storedSession.supabaseSession)
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session) {
    // Store the session
    await chrome.storage.local.set({ supabaseSession: session })
    return session
  }

  const manifest = chrome.runtime.getManifest()

  const url = new URL('https://accounts.google.com/o/oauth2/auth')

  url.searchParams.set('client_id', manifest.oauth2.client_id)
  url.searchParams.set('response_type', 'id_token')
  url.searchParams.set('access_type', 'offline')
  const redirectURI = `https://${chrome.runtime.id}.chromiumapp.org`
  url.searchParams.set('redirect_uri', redirectURI)
  url.searchParams.set('scope', manifest.oauth2.scopes.join(' '))

  try {
    const redirectedTo = await launchWebAuthFlow(url.toString(), true)

    // auth was successful, extract the ID token from the redirectedTo URL
    if (!redirectedTo) {
      return null
    }
    const redirectedUrl = new URL(redirectedTo)

    const params = new URLSearchParams(redirectedUrl.hash.replace('#', ''))
    const idToken = params.get('id_token')
    if (!idToken) {
      return null
    }
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    })
    if (error) {
      console.error('Error logging in:', error.message)
      return null
    } else {
      // Store the new session
      const {
        data: { session: newSession },
      } = await supabase.auth.getSession()
      if (newSession) {
        await chrome.storage.local.set({ supabaseSession: newSession })
      }
      return newSession
    }
  } catch (error) {
    console.error('Error logging in:', error)
    return null
  }
}

export const logout = async (): Promise<void> => {
  await supabase.auth.signOut()
  await chrome.storage.local.remove('supabaseSession')
}
