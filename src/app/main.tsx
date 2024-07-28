import { RouterProvider } from '@tanstack/react-router'
import { createRoot } from 'react-dom/client'
import '../services/sentry'
import { configureSentryUser } from '../services/sentry'
import { setupAuthListener } from '../services/auth-listener'
import './base.scss'
import './i18n'

import { router } from './router'

const container = document.getElementById('app')!
const root = createRoot(container)

configureSentryUser()
  .then(() => {
    try {
      setupAuthListener()
    } catch (error) {
      console.error('Failed to set up auth listener:', error)
    }
    root.render(<RouterProvider router={router} />)
  })

  // Catch any errors in configureSentryUser and still render the app
  .catch((error) => {
    console.error('Failed to configure Sentry user:', error)
    try {
      setupAuthListener()
    } catch (error) {
      console.error('Failed to set up auth listener:', error)
    }
    root.render(<RouterProvider router={router} />)
  })
