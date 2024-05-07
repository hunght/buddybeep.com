import { createClient } from '@supabase/supabase-js'
import { Database } from './schema'

const supabaseUrl = import.meta.env.VITE_REACT_APP_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_REACT_APP_ANON_KEY as string

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export default supabase
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
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session) {
    const userId = session.user.id

    return userId
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
      return
    }
    const redirectedUrl = new URL(redirectedTo)

    const params = new URLSearchParams(redirectedUrl.hash.replace('#', ''))
    const idToken = params.get('id_token')
    if (!idToken) {
      return
    }
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    })
    if (error) {
      console.error('Error logging in:', error.message)
    } else {
      return data.user.id
    }
  } catch (error) {
    console.error('Error logging in:', error)
  }
}
