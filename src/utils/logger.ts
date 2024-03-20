import { Sentry } from '~services/sentry'
import { isProduction } from '~utils'

const logger = {
  log: (...messages: any[]) => {
    if (!isProduction()) {
      console.log(...messages)
    }
  },

  error: (...errors: any[]) => {
    console.error(...errors) // Always log errors in the console
    if (isProduction()) {
      Sentry.captureException(errors[0]) // Send the first error to Sentry
    }
  },

  warn: (...warnings: any[]) => {
    if (!isProduction()) {
      console.warn(...warnings)
    }
  },

  info: (...infos: any[]) => {
    if (!isProduction()) {
      console.info(...infos)
    }
  },

  debug: (...debugs: any[]) => {
    if (!isProduction()) {
      console.debug(...debugs)
    }
  },
}

export default logger
