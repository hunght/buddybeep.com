import { ofetch } from 'ofetch'
import logger from '~utils/logger'

export async function fetchArkoseToken(): Promise<string | undefined> {
  try {
    const resp = await ofetch('https://buddybeep.com/api/arkose')
    return resp.token
  } catch (err) {
    logger.error(err)
    return undefined
  }
}
