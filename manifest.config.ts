import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest(async () => {
  return {
    manifest_version: 3,
    name: '__MSG_appName__',
    description: '__MSG_appDesc__',
    default_locale: 'en',
    version: '1.6.1',
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
    optional_host_permissions: ['wss://*/*'],
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
        matches: ['https://medium.com/*'],
        js: ['src/content-script/side-bar/index.tsx'],
      },
      {
        matches: ['https://www.youtube.com/*'],
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
