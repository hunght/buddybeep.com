import { createParser } from 'eventsource-parser'
import { isEmpty } from 'lodash-es'
import logger from '~utils/logger'
import { streamAsyncIterable } from '~utils/stream-async-iterable'

export async function fetchSSE(resource: string, options: RequestInit & { onMessage: (message: string) => void }) {
  const { onMessage, ...fetchOptions } = options
  const resp = await fetch(resource, fetchOptions)
  if (!resp.ok) {
    const error = await resp.json().catch(() => ({}))
    throw new Error(!isEmpty(error) ? JSON.stringify(error) : `${resp.status} ${resp.statusText}`)
  }
  const parser = createParser((event) => {
    if (event.type === 'event') {
      onMessage(event.data)
    }
  })
  for await (const chunk of streamAsyncIterable(resp.body!)) {
    const str = new TextDecoder().decode(chunk)
    logger.log('fetchSSE', str)
    if (str.includes('wss_url')) {
      onMessage(str)
    }
    parser.feed(str)
  }
}
