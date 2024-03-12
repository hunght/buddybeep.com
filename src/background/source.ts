import { getOrGenerateUserUUID } from '~app/utils/localStorage'

async function trackEvent(name: string, props: object) {
  try {
    console.log('plausible.trackEvent', name, props)
  } catch (err) {
    console.error('plausible.trackEvent error', err)
  }
}

export async function trackInstallSource() {
  // const { source } = await ofetch('https://buddybeep.com/api/user/source', {
  //   credentials: 'include',
  // })
  trackEvent('install', { source: getOrGenerateUserUUID(), language: navigator.language })
}
