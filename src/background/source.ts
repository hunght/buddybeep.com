import { getOrGenerateUserUUID } from '~app/utils/localStorage'
import logger from '~utils/logger'

async function trackEvent(name: string, props: object) {
  try {
    logger.log('plausible.trackEvent', name, props)
  } catch (err) {
    logger.error('plausible.trackEvent error', err)
  }
}

export async function trackInstallSource() {
  // const { source } = await ofetch('https://buddybeep.com/api/user/source', {
  //   credentials: 'include',
  // })
  trackEvent('install', { source: getOrGenerateUserUUID(), language: navigator.language })
}
