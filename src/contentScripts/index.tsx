/* eslint-disable no-console */
import { createRoot } from 'react-dom/client'
import { onMessage } from 'webext-bridge/content-script'

import { App } from './views/App'

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
;

(() => {
  console.info('[thebrowserruntimeai] Hello world from content script')

  // communication example: send previous tab title from background page
  onMessage('tab-prev', ({ data }) => {
    console.log(`[thebrowserruntimeai] Navigate from page "${data.title}"`)
  })

  // mount component to context window
  const container = document.createElement('div')
  const root = document.createElement('div')
  container.className = 'thebrowserruntimeai'
  container.id = 'thebrowserruntimeai'
  const styleEl = document.createElement('link')
  const shadowDOM = container.attachShadow?.({ mode: __DEV__ ? 'open' : 'closed' }) || container
  styleEl.setAttribute('rel', 'stylesheet')
  styleEl.setAttribute('href', browser.runtime.getURL('dist/contentScripts/style.css'))
  shadowDOM.appendChild(styleEl)
  shadowDOM.appendChild(root)
  document.body.appendChild(container)
  const $root = createRoot(root, {
    onRecoverableError: (error) => {
      console.error('[thebrowserruntimeai] Error', error)
    },
  })
  $root.render(<App />)
})()
