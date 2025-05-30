import fs from 'fs-extra'

import {
  isDev,
  port,
  r,
} from '../scripts/utils'

import type { Manifest } from 'webextension-polyfill'
import type PkgType from '../package.json'

export async function getManifest() {
  const pkg = (await fs.readJSON(r('package.json'))) as typeof PkgType

  // update this file to update this manifest.json
  // can also be conditional based on your need
  const manifest: Manifest.WebExtensionManifest = {
    manifest_version: 3,
    // @ts-expect-error -- use pkg displayName if available
    name: pkg.displayName || pkg.name,
    version: pkg.version,
    description: pkg.description,
    action: {
      default_icon: './assets/icon-512.png',
      // default_popup: './dist/popup/index.html',
    },
    options_ui: {
      page: './dist/options/index.html',
      open_in_tab: true,
    },
    background: process.env.IS_FIREFOX_WEBEXT
      ? {
          scripts: ['./dist/background/index.mjs'],
          type: 'module',
        }
      : {
          service_worker: './dist/background/index.mjs',
        },
    icons: {
      // 16: './assets/icon-512.png',
      // 48: './assets/icon-512.png',
      512: './assets/icon-512.png',
    },
    optional_permissions: ['trialML'],
    permissions: ['menus', 'tabs', 'storage', 'activeTab', 'scripting'],
    host_permissions: ['*://*/*'],
    content_scripts: [
      {
        matches: ['http://*/*', 'https://*/*'],
        js: ['./dist/contentScripts/index.global.js'],
      },
    ],
    web_accessible_resources: [
      {
        resources: ['dist/contentScripts/style.css'],
        matches: ['<all_urls>'],
      },
    ],
    content_security_policy: {
      extension_pages: isDev
        // this is required on dev for Vite script to load
        ? `script-src \'self\' http://localhost:${port}; object-src \'self\'`
        : 'script-src \'self\'; object-src \'self\'',
    },
    browser_specific_settings: {
      gecko: {
        id: 'thebrowserruntimeai@gmail.com',
      },
    },
  }

  if (isDev) {
    manifest.permissions?.push('webNavigation')
  }

  return manifest
}
