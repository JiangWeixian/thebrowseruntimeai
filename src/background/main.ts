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

type TaskName = 'image-to-text' | 'summarization'
// Initialize the Map to track first run status per tab
const firstRunOnTab = new Map<number, Record<string, boolean | undefined>>()

/**
 * Checks if this is the first run on a specific tab.
 * Defaults to true if the tab has no entry in the map.
 *
 * @param {number} tabId - The ID of the tab.
 * @returns {boolean} - True if this is the first run on this tab, false otherwise.
 */
function isFirstRun(tabId?: number, taskName?: TaskName) {
  if (!tabId) {
    return true
  }
  if (!taskName) {
    return true
  }
  return firstRunOnTab.get(tabId)?.[taskName] !== false
}

/**
 * Sets the first run status for a specific tab.
 *
 * @param {number} tabId - The ID of the tab.
 * @param {boolean} isFirstRun - True if this is the first run on this tab, false otherwise.
 */
function setFirstRun(tabId: number, taskName: TaskName, isFirstRun: boolean) {
  firstRunOnTab.set(tabId, { ...(firstRunOnTab.get(tabId) ?? {}), [taskName]: isFirstRun })
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
  console.debug(res)
}

/**
 * Called in the tab content
 */
async function summaryText(text: string) {
  self.__THEBROWSERRUNTIMEAI__.success('Thinking...')
  const res: any = await browser.trial.ml.runEngine({
    args: [text],
  })
  const item = res[0]
  self.__THEBROWSERRUNTIMEAI__.success(item.summary_text)
  console.debug(res)
}

async function testToast() {
  self.__THEBROWSERRUNTIMEAI__.test()
}

// image-to-text handler
// async function handleGenerateAltText(info: Menus.OnClickData, tab?: Tabs.Tab) {
//   const tabId = tab?.id
//   if (!tabId) {
//     return
//   }

//   const listener = (progressData: TrialMl.OnProgressProgressDataType) => {
//     browser.tabs.sendMessage(tabId, progressData)
//     console.log('progressData', progressData)
//   }

//   browser.trial.ml.onProgress.addListener(listener)
//   try {
//     if (isFirstRun(tabId)) {
//       // injecting content-script.js, which creates the AltTextModal instance.
//       // await browser.scripting.executeScript({
//       //   target: { tabId },
//       //   files: ['./content-script.js'],
//       // })

//       // initializing toast
//       browser.tabs.sendMessage(tabId, { type: 'initializing' })

//       await browser.trial.ml.createEngine({
//         modelHub: 'mozilla',
//         taskName: 'image-to-text',
//       })
//     }
//     // running generateAltText
//     await browser.scripting.executeScript({
//       target: {
//         tabId,
//       },
//       func: generateAltText,
//       args: [info.targetElementId],
//     })
//   } finally {
//     browser.trial.ml.onProgress.removeListener(listener)
//     setFirstRun(tabId, false)
//   }
// }

// refs: https://firefox-source-docs.mozilla.org/toolkit/components/ml/extensions.html#webextensions-ai-api
const createTaskHandler = (taskName: TaskName, handler: (info: Menus.OnClickData, tab?: Tabs.Tab) => Promise<any>) => {
  return async (info: Menus.OnClickData, tab?: Tabs.Tab) => {
    const tabId = tab?.id
    if (!tabId) {
      return
    }

    const listener = (progressData: TrialMl.OnProgressProgressDataType) => {
      browser.tabs.sendMessage(tabId, { type: 'progress', payload: progressData })
      // console.log('progressData', progressData)
    }

    browser.trial.ml.onProgress.addListener(listener)
    try {
      if (isFirstRun(tabId, taskName)) {
        // initializing toast
        browser.tabs.sendMessage(tabId, { type: 'initializing' })

        await browser.trial.ml.createEngine({
          taskName,
        })
      }
      // running generateAltText
      await handler(info, tab)
    } finally {
      browser.trial.ml.onProgress.removeListener(listener)
      setFirstRun(tabId, taskName, false)
    }
  }
}

browser.menus.create({
  id: 'image-to-text',
  title: 'Image to Text',
  documentUrlPatterns: ['*://*/*'],
  contexts: ['image'],
})

browser.menus.create({
  id: 'summarization',
  title: 'Summarization',
  documentUrlPatterns: ['*://*/*'],
  contexts: ['page', 'selection'],
})

browser.menus.create({
  id: 'test-toast',
  title: 'test-toast',
  documentUrlPatterns: ['*://*/*'],
  contexts: ['image'],
})

const handleGenerateAltText = createTaskHandler('image-to-text', async (info, tab) => {
  return await browser.scripting.executeScript({
    target: {
      tabId: tab!.id!,
    },
    func: generateAltText,
    args: [info.targetElementId],
  })
})

const handleSummarization = createTaskHandler('summarization', async (info, tab) => {
  let selectedText = info.selectionText
  const tabId = tab?.id
  if (!selectedText) {
    browser.tabs.sendMessage(tabId!, {
      type: 'notification',
      payload: {
        message: 'Convert page to markdown...',
        level: 'info',
      },
    })
    selectedText = await browser.tabs.sendMessage(tabId!, { type: 'get-readable-text' })
  }
  console.debug('selectedText', selectedText)
  if (!selectedText) {
    return
  }
  return await browser.scripting.executeScript({
    target: {
      tabId: tabId!,
    },
    func: summaryText,
    args: [selectedText],
  })
})

browser.menus.onClicked.addListener(async (info, tab) => {
  console.log('test', info, tab)
  if (info.menuItemId === 'image-to-text') {
    await handleGenerateAltText(info, tab)
  }
  if (info.menuItemId === 'summarization') {
    await handleSummarization(info, tab)
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

// request permission if not granted
browser.permissions.contains({ permissions: ['trialML'] }).then((granted) => {
  if (!granted) {
    browser.tabs.create({ url: browser.runtime.getURL('./dist/options/index.html') })
  }
})
