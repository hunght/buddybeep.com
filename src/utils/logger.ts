import { isProduction } from '~utils'

const logger = {
  log: (...messages: any[]) => {
    if (!isProduction()) {
      console.log(...messages)
    }
  },

  error: (...errors: any[]) => {
    try {
      console.error(...errors) // Always log errors in the console
    } catch (error) {
      console.log(`==== error ===`)
      console.log(error)
      console.log('==== end log ===')
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
