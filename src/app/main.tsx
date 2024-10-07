import { RouterProvider } from '@tanstack/react-router'
import { createRoot } from 'react-dom/client'
import '../services/sentry'
import './base.scss'
import './i18n'

import { initGA } from '~/services/analytics'
import { router } from './router'

// Initialize Google Analytics
initGA()

const container = document.getElementById('app')!
const root = createRoot(container)

root.render(<RouterProvider router={router} />)
