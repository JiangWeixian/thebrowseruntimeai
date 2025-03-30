// import { onMessage, sendMessage } from 'webext-bridge'

import type { Tabs } from 'webextension-polyfill'

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('Extension installed')
})

let previousTabId = 0

// communication example: send previous tab title from background page
// see shim.d.ts for type declaration
browser.tabs.onActivated.addListener(async ({ tabId }) => {
  if (!previousTabId) {
    previousTabId = tabId
    return
  }

  let tab: Tabs.Tab

  try {
    tab = await browser.tabs.get(previousTabId)
    previousTabId = tabId
  } catch {
    return
  }

  // eslint-disable-next-line no-console
  console.log('previous tab', tab)
  // sendMessage('tab-prev', { title: tab.title }, { context: 'content-script', tabId })
})

// Initialize the Map to track first run status per tab
const firstRunOnTab = new Map()

/**
 * Checks if this is the first run on a specific tab.
 * Defaults to true if the tab has no entry in the map.
 *
 * @param {number} tabId - The ID of the tab.
 * @returns {boolean} - True if this is the first run on this tab, false otherwise.
 */
function isFirstRun(tabId?: number) {
  return firstRunOnTab.get(tabId) !== false
}

/**
 * Sets the first run status for a specific tab.
 *
 * @param {number} tabId - The ID of the tab.
 * @param {boolean} isFirstRun - True if this is the first run on this tab, false otherwise.
 */
function setFirstRun(tabId: number, isFirstRun: boolean) {
  firstRunOnTab.set(tabId, isFirstRun)
}

/**
 * Called in the tab content
 */
async function generateAltText(targetElementId: number) {
  const imageUrl = browser.menus.getTargetElement(targetElementId).src
  const res = await browser.trial.ml.runEngine({
    args: [imageUrl],
  })
  console.log(res)

  // getModal is defined in content-script.js
  // const modal = getModal()
  // try {
  //   const imageUrl = browser.menus.getTargetElement(targetElementId).src
  //   modal.updateText('Running inference...')

  //   const res = await browser.trial.ml.runEngine({
  //     args: [imageUrl],
  //   })
  //   modal.updateText(res[0].generated_text)
  // } catch (err) {
  //   modal.updateText(`${err}`)
  // }
}

// image-to-text handler
async function handleGenerateAltText(info, tab?: Tabs.Tab) {
  const tabId = tab.id
  if (!tabId) {
    return
  }

  // if (isFirstRun(tabId)) {
  //   browser.tabs.insertCSS(tabId, {
  //     file: './alt-text-modal.css',
  //   })
  // }

  const listener = (progressData) => {
    console.log('progressData', progressData)
    // browser.tabs.sendMessage(tabId, progressData)
  }

  browser.trial.ml.onProgress.addListener(listener)
  try {
    if (isFirstRun(tabId)) {
      // injecting content-script.js, which creates the AltTextModal instance.
      // await browser.scripting.executeScript({
      //   target: { tabId },
      //   files: ['./content-script.js'],
      // })

      // running generateAltText
      // await browser.scripting.executeScript({
      //   target: {
      //     tabId: tab.id,
      //   },
      //   func: initModal,
      // })

      await browser.trial.ml.createEngine({
        modelHub: 'mozilla',
        taskName: 'image-to-text',
      })
    }
    // running generateAltText
    await browser.scripting.executeScript({
      target: {
        tabId,
      },
      func: generateAltText,
      args: [info.targetElementId],
    })
  } finally {
    browser.trial.ml.onProgress.removeListener(listener)
    setFirstRun(tabId, false)
  }
}

browser.menus.create({
  id: 'generate-alt-text',
  title: 'Generate Alt Text',
  documentUrlPatterns: ['*://*/*'],
  contexts: ['image'],
})

browser.menus.onClicked.addListener((info, tab) => {
  console.log('test', info, tab)
  handleGenerateAltText(info, tab)
})

// onMessage('get-current-tab', async () => {
//   try {
//     const tab = await browser.tabs.get(previousTabId)
//     return {
//       title: tab?.id,
//     }
//   } catch {
//     return {
//       title: undefined,
//     }
//   }
// })
