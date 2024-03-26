import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest(async () => {
  return {
    manifest_version: 3,
    name: '__MSG_appName__',
    description: '__MSG_appDesc__',
    default_locale: 'en',
    version: '1.4.0',
    icons: {
      '16': 'src/assets/icon.png',
      '32': 'src/assets/icon.png',
      '48': 'src/assets/icon.png',
      '128': 'src/assets/icon.png',
    },
    background: {
      service_worker: 'src/background/index.ts',
      type: 'module',
    },
    action: {},
    host_permissions: [
      'https://*.bing.com/',
      'https://*.openai.com/',
      'https://gemini.google.com/',
      'https://*.buddybeep.com/',
      'https://*.duckduckgo.com/',
      'https://*.poe.com/',
      'https://*.anthropic.com/',
      'https://*.claude.ai/',
    ],
    optional_host_permissions: ['https://*/*', 'wss://*/*'],
    permissions: [
      'contextMenus',
      'storage',
      'unlimitedStorage',
      'declarativeNetRequestWithHostAccess',
      'sidePanel',
      'scripting',
    ],
    side_panel: {
      default_path: 'sidepanel.html',
    },
    content_scripts: [
      {
        matches: ['https://chat.openai.com/*'],
        js: ['src/content-script/chatgpt-inpage-proxy.ts'],
      },
      {
        matches: ['https://*/*'],
        js: ['src/content-script/side-bar/index.tsx'],
      },
      {
        matches: [
          'https://www.youtube.com/*',
          'https://en.wikipedia.org/*',
          'https://www.facebook.com/*',
          'https://www.instagram.com/*',
          'https://twitter.com/*', // Also known as X
          'https://www.whatsapp.com/*',
          'https://www.pornhub.com/*',
          'https://www.pinterest.com/*',
          'https://play.google.com/*',
          'https://www.microsoft.com/*',
          'https://www.imdb.com/*',
          'https://www.reddit.com/*',
          'https://www.amazon.com/*',
          'https://www.xnxx.com/*',
          'https://www.apple.com/*',
          'https://www.tiktok.com/*',
          'https://es.wikipedia.org/*', // Spanish version of Wikipedia
          'https://www.xvideos.com/*',
          'https://www.nytimes.com/*',
          'https://www.globo.com/*',
          // Including sites similar to Medium as requested
          'https://substack.com/*',
          'https://www.vocal.media/*',
          'https://dev.to/*', // Focus on developers
          'https://www.linkedin.com/*', // LinkedIn Articles
          'https://www.quora.com/*', // Quora Spaces
          'https://ghost.org/*',
          'https://wordpress.com/*', // WordPress Blogs
          'https://www.blogger.com/*', // Blogger
        ],
        js: ['src/content-script/youtube-caption/index.tsx'],
      },
    ],
    commands: {
      'open-app': {
        suggested_key: {
          default: 'Alt+B',
          windows: 'Alt+B',
          linux: 'Alt+B',
          mac: 'Command+B',
        },
        description: 'Open BuddyBeep app',
      },
    },

    declarative_net_request: {
      rule_resources: [
        {
          id: 'ruleset_bing',
          enabled: true,
          path: 'src/rules/bing.json',
        },
        {
          id: 'ruleset_ddg',
          enabled: true,
          path: 'src/rules/ddg.json',
        },
        {
          id: 'ruleset_qianwen',
          enabled: true,
          path: 'src/rules/qianwen.json',
        },
        {
          id: 'ruleset_baichuan',
          enabled: true,
          path: 'src/rules/baichuan.json',
        },
        {
          id: 'ruleset_pplx',
          enabled: true,
          path: 'src/rules/pplx.json',
        },
      ],
    },
  }
})
