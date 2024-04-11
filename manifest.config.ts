import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest(async () => {
  return {
    manifest_version: 3,
    name: '__MSG_appName__',
    description: '__MSG_appDesc__',
    default_locale: 'en',
    version: '1.8.0',
    icons: {
      '16': 'src/assets/logo-64.png',
      '32': 'src/assets/logo-64.png',
      '48': 'src/assets/logo-48.png',
      '128': 'src/assets/logo-128.png',
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
      'identity',
      'contextMenus',
      'storage',
      'unlimitedStorage',
      'declarativeNetRequestWithHostAccess',
      'sidePanel',
      'scripting',
      'activeTab',
    ],
    oauth2: {
      client_id: '13736349601-9nol47qdus5r0ou75dmjjk11l8fqcub8.apps.googleusercontent.com',
      scopes: ['openid', 'email', 'profile'],
    },
    side_panel: {
      default_path: 'sidepanel.html',
    },
    content_scripts: [
      {
        matches: ['https://chat.openai.com/*'],
        js: ['src/content-script/chatgpt-inpage-proxy.ts'],
      },
      {
        matches: [
          'https://google.com/*',
          'https://www.google.com/*',
          'https://www.bing.com/*',
          'https://www.duckduckgo.com/*',
        ],
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
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApCt1ng0yJkefftGa3vC9Ase22Ii+h5M2Ap58ZEGwkI+9tpeTZzJQmJCdt8jW+Gu+11WO0n7iUKk8larF+Hk7B501EK2IX8enZpCot2bvwNOtRNOdpHfA1Wd6yvyG0sp/s2ddNCgw7PoQtG0rvc84CiNY+VteR+Yb2N27pw2xVuzBuxgTrxhElM92sHkqa392kIxI0YYMrkaamR6zlafqm8d9OHCsSP3uh9mF/rNgb1bF9n6/eC2M7BVtCcTPay94F53ds8uzXtZZD1LK4RstYVTCYxzBhrsi/PllTClep6Jw+TUoIUF+e/Ly2/6ijhLb3DnIswIzWi6S+xWZBtzscQIDAQAB',
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
