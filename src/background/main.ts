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
})

type TaskName = 'image-classification' | 'image-to-text' | 'summarization' | 'text-classification' | 'text-generation' | 'translation'
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
  console.log('isFirstRun', tabId, taskName, firstRunOnTab)
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
  self.__THEBROWSERRUNTIMEAI__.success('Thinking...')
  const imageUrl = (browser.menus.getTargetElement(targetElementId) as HTMLImageElement).src
  self.__THEBROWSERRUNTIMEAI__.success('Thinking...')
  const res: any = await browser.trial.ml.runEngine({
    args: [imageUrl],
  })
  const item = res[0]
  self.__THEBROWSERRUNTIMEAI__.success(item.generated_text)
  console.debug('image-to-text', res)
}

async function summaryText(text: string) {
  self.__THEBROWSERRUNTIMEAI__.success('Thinking...')
  const res: any = await browser.trial.ml.runEngine({
    args: [text],
  })
  const item = res[0]
  self.__THEBROWSERRUNTIMEAI__.success(item.summary_text)
  console.debug('summaryText', res)
}

async function translate(text: string, tgt_lang: string = 'zh') {
  self.__THEBROWSERRUNTIMEAI__.success('Thinking...')
  const res: any = await browser.trial.ml.runEngine({
    args: [
      text,
      {
        tgt_lang,
      },
    ],
  })
  console.log('translate', res)
  const item = res[0]
  self.__THEBROWSERRUNTIMEAI__.success(item.translation_text)
}

async function textClassification(text: string) {
  self.__THEBROWSERRUNTIMEAI__.success('Thinking...')
  const res: any = await browser.trial.ml.runEngine({
    args: [
      text,
    ],
  })
  console.log('text-classification', res)
  const item = res[0]
  self.__THEBROWSERRUNTIMEAI__.success(JSON.stringify(item))
}

async function textGeneration(text: string) {
  self.__THEBROWSERRUNTIMEAI__.success('Thinking...')
  const res: any = await browser.trial.ml.runEngine({
    args: [
      text,
    ],
  })
  console.log('text-generation', res)
  const item = res[0]
  self.__THEBROWSERRUNTIMEAI__.success(item.generated_text)
}

async function imageClassification(targetElementId: number) {
  const imageUrl = (browser.menus.getTargetElement(targetElementId) as HTMLImageElement).src
  self.__THEBROWSERRUNTIMEAI__.success('Thinking...')
  const res: any = await browser.trial.ml.runEngine({
    args: [imageUrl],
  })
  const item = res[0]
  self.__THEBROWSERRUNTIMEAI__.success(JSON.stringify(item))
  console.debug('image-classification', res)
}

const config: Record<TaskName, {
  modelHub?: 'huggingface' | 'mozilla'
  modelId?: string
}> = {
  'image-to-text': {},
  summarization: {},
  translation: {
    modelHub: 'huggingface',
    modelId: 'Xenova/m2m100_418M',
  },
  'text-classification': {
    modelHub: 'huggingface',
    modelId: 'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
  },
  'text-generation': {
    modelHub: 'huggingface',
    modelId: 'Xenova/distilgpt2',
  },
  'image-classification': {
    modelHub: 'huggingface',
    modelId: 'Xenova/vit-base-patch16-224',
  },
}

// refs: https://firefox-source-docs.mozilla.org/toolkit/components/ml/extensions.html#webextensions-ai-api
const createTaskHandler = (taskName: TaskName, handler: (info: Menus.OnClickData, tab?: Tabs.Tab) => Promise<any>) => {
  return async (info: Menus.OnClickData, tab?: Tabs.Tab) => {
    const tabId = tab?.id
    if (!tabId) {
      return
    }

    const listener = (progressData: TrialMl.OnProgressProgressDataType) => {
      browser.tabs.sendMessage(tabId, { type: 'progress', payload: progressData })
      console.log('progressData', progressData)
    }

    browser.trial.ml.onProgress.addListener(listener)
    try {
      if (isFirstRun(tabId, taskName)) {
        // initializing toast
        browser.tabs.sendMessage(tabId, { type: 'initializing' })

        await browser.trial.ml.createEngine({
          taskName,
          ...config[taskName],
        })
      }
      await handler(info, tab)
    } finally {
      browser.trial.ml.onProgress.removeListener(listener)
      setFirstRun(tabId, taskName, false)
    }
  }
}

// Image to Text
browser.menus.create({
  id: 'image-to-text',
  title: 'Image to Text',
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

// Summarization
browser.menus.create({
  id: 'summarization',
  title: 'Summarization',
  documentUrlPatterns: ['*://*/*'],
  contexts: ['page', 'selection'],
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

// Translation to Chinese
browser.menus.create({
  id: 'translation-to-zh',
  title: 'Translate to Chinese',
  documentUrlPatterns: ['*://*/*'],
  contexts: ['selection'],
})

// Translation to English
browser.menus.create({
  id: 'translation-to-en',
  title: 'Translate to English',
  documentUrlPatterns: ['*://*/*'],
  contexts: ['selection'],
})

const handleTranslate = createTaskHandler('translation', async (info, tab) => {
  const selectedText = info.selectionText
  const tabId = tab?.id
  if (!selectedText) {
    return
  }
  return await browser.scripting.executeScript({
    target: {
      tabId: tabId!,
    },
    func: translate,
    args: [selectedText, info.menuItemId === 'translation-to-zh' ? 'zh' : 'en'],
  })
})

browser.menus.create({
  id: 'text-classification',
  title: 'Text Classification',
  documentUrlPatterns: ['*://*/*'],
  contexts: ['selection'],
})

const handleTextClassification = createTaskHandler('text-classification', async (info, tab) => {
  const selectedText = info.selectionText
  const tabId = tab?.id
  if (!selectedText) {
    return
  }
  return await browser.scripting.executeScript({
    target: {
      tabId: tabId!,
    },
    func: textClassification,
    args: [selectedText],
  })
})

browser.menus.create({
  id: 'text-generation',
  title: 'Text Generation',
  documentUrlPatterns: ['*://*/*'],
  contexts: ['selection'],
})

const handleTextGeneration = createTaskHandler('text-generation', async (info, tab) => {
  const selectedText = info.selectionText
  const tabId = tab?.id
  if (!selectedText) {
    return
  }
  return await browser.scripting.executeScript({
    target: {
      tabId: tabId!,
    },
    func: textGeneration,
    args: [selectedText],
  })
})

browser.menus.create({
  id: 'image-classification',
  title: 'Image Classification',
  documentUrlPatterns: ['*://*/*'],
  contexts: ['image'],
})

const handleImageClassification = createTaskHandler('image-classification', async (info, tab) => {
  const tabId = tab?.id
  return await browser.scripting.executeScript({
    target: {
      tabId: tabId!,
    },
    func: imageClassification,
    args: [info.targetElementId],
  })
})

// browser.menus.create({
//   id: 'test-toast',
//   title: 'test-toast',
//   documentUrlPatterns: ['*://*/*'],
//   contexts: ['image'],
// })

// async function testToast() {
//   self.__THEBROWSERRUNTIMEAI__.test()
// }

browser.menus.onClicked.addListener(async (info, tab) => {
  console.log('test', info, tab)
  try {
    if (info.menuItemId === 'image-to-text') {
      return await handleGenerateAltText(info, tab)
    }
    if (info.menuItemId === 'summarization') {
      return await handleSummarization(info, tab)
    }
    if (info.menuItemId === 'translation-to-zh' || info.menuItemId === 'translation-to-en') {
      return await handleTranslate(info, tab)
    }
    if (info.menuItemId === 'text-classification') {
      return await handleTextClassification(info, tab)
    }
    if (info.menuItemId === 'text-generation') {
      return await handleTextGeneration(info, tab)
    }
    if (info.menuItemId === 'image-classification') {
      return await handleImageClassification(info, tab)
    }
    // if (info.menuItemId === 'test-toast' && tab?.id) {
    //   await browser.scripting.executeScript({
    //     target: {
    //       tabId: tab?.id,
    //     },
    //     func: testToast,
    //   })
    // }
  } catch (error) {
    console.error('error', error)
    await browser.tabs.sendMessage(tab!.id!, {
      type: 'notification',
      payload: {
        message: error instanceof Error ? error.message : JSON.stringify(error),
        level: 'error',
      },
    })
  }
})

// request permission if not granted
browser.permissions.contains({ permissions: ['trialML'] }).then((granted) => {
  if (!granted) {
    browser.tabs.create({ url: browser.runtime.getURL('./dist/options/index.html') })
  }
})
