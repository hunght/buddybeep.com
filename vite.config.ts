import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import jotaiDebugLabel from 'jotai/babel/plugin-debug-label'
import jotaiReactRefresh from 'jotai/babel/plugin-react-refresh'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import manifest from './manifest.config'
import { sentryVitePlugin } from '@sentry/vite-plugin'
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      tsconfigPaths(),
      react({
        babel: {
          plugins: [jotaiDebugLabel, jotaiReactRefresh],
        },
      }),
      crx({ manifest }),
      sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: 'nexttradingbot',
        project: 'extensions',
      }),
    ],
    build: {
      sourcemap: true,
      rollupOptions: {
        input: ['app.html'],
      },
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    server: {
      strictPort: true,
      port: 5173,
      hmr: {
        clientPort: 5173,
      },
    },
  }
})
