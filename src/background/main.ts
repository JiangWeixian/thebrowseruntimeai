import type { Menus, Tabs } from 'webextension-polyfill'
import type { TrialMl } from 'webextension-polyfill/namespaces/trial_ml'

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
  const imageUrl = (browser.menus.getTargetElement(targetElementId) as HTMLImageElement).src
  self.__THEBROWSERRUNTIMEAI__.success('Thinking...')
  const res: any = await browser.trial.ml.runEngine({
    args: [imageUrl],
  })
  const item = res[0]
  self.__THEBROWSERRUNTIMEAI__.success(item.generated_text)
  console.log(res)
}

async function testToast() {
  self.__THEBROWSERRUNTIMEAI__.test()
}

// image-to-text handler
async function handleGenerateAltText(info: Menus.OnClickData, tab?: Tabs.Tab) {
  const tabId = tab?.id
  if (!tabId) {
    return
  }

  const listener = (progressData: TrialMl.OnProgressProgressDataType) => {
    browser.tabs.sendMessage(tabId, progressData)
    console.log('progressData', progressData)
  }

  browser.trial.ml.onProgress.addListener(listener)
  try {
    if (isFirstRun(tabId)) {
      // injecting content-script.js, which creates the AltTextModal instance.
      // await browser.scripting.executeScript({
      //   target: { tabId },
      //   files: ['./content-script.js'],
      // })

      // initializing toast
      browser.tabs.sendMessage(tabId, { type: 'initializing' })

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
  id: 'image-to-text',
  title: 'Image to Text',
  documentUrlPatterns: ['*://*/*'],
  contexts: ['image'],
})

browser.menus.create({
  id: 'test-toast',
  title: 'test-toast',
  documentUrlPatterns: ['*://*/*'],
  contexts: ['image'],
})

browser.menus.onClicked.addListener(async (info, tab) => {
  console.log('test', info, tab)
  if (info.menuItemId === 'image-to-text') {
    await handleGenerateAltText(info, tab)
  }
  if (info.menuItemId === 'test-toast' && tab?.id) {
    await browser.scripting.executeScript({
      target: {
        tabId: tab?.id,
      },
      func: testToast,
    })
  }
})
