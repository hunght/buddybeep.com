import { ofetch } from 'ofetch'

export async function fetchArkoseToken(): Promise<string | undefined> {
  try {
    const resp = await ofetch('https://buddybeep.com/api/arkose')
    return resp.token
  } catch (err) {
    console.error(err)
    return undefined
  }
}
