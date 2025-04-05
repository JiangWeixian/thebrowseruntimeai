import '~/style.css'
import 'sonner/dist/styles.css'

import { useEffect } from 'react'
import { toast } from 'sonner'

import { DownloadProgress } from '~/components/download-progress'
import { Button } from '~/components/ui/button'
import { Toaster } from '~/components/ui/sonner'
import { useBearStore } from '~/hooks/use-store'
import { readableText } from '~/logic/html'

import type { Message } from '~/logic/types'

let toastId: number | string | undefined

self.__THEBROWSERRUNTIMEAI__ = {
  success: (message: string) => {
    toast.dismiss(toastId)
    toast.success(message, { duration: Infinity, action: { label: 'Dismiss all', onClick: () => toast.dismiss() } })
  },
  test: () => {
    const toastId = toast(
      () => {
        return 'Downloading...'
      },
      {
        description: () => {
          return <DownloadProgress />
        },
        // @ts-expect-error -- ignore
        cancel: () => {
          return <Button size="sm" onClick={() => toast.dismiss(toastId)}>Cancel</Button>
        },
        duration: Infinity,
      },
    )
  },
}

export const App = () => {
  const { updateProgress } = useBearStore()
  useEffect(() => {
    const styleEl = document.createElement('style')
    styleEl.textContent = '[data-sonner-toaster] { display: none; }'
    document.head.appendChild(styleEl)
  }, [])
  useEffect(() => {
    browser.runtime.onMessage.addListener((_data, _sender, sendResponse) => {
      const data = _data as unknown as Message
      if (data.type === 'progress') {
        const alreadyLoaded = typeof data.payload.progress !== 'number'
        updateProgress(data.payload.metadata.file, data.payload)
        if (!toastId && !alreadyLoaded) {
          toastId = toast(
            () => {
              return 'Downloading...'
            },
            {
              description: () => {
                return <DownloadProgress />
              },
              duration: Infinity,
            },
          )
        }
      }
      if (data.type === 'initializing') {
        toast('Initializing...', { duration: Infinity })
      }
      if (data.type === 'notification') {
        const { message, level } = data.payload
        const fn = toast[level]
        fn(message)
      }
      if (data.type === 'get-readable-text') {
        const text = readableText(document.cloneNode(true) as Document)
        sendResponse(text)
      }
      return true
    })
  }, [updateProgress])
  return (
    <div id="thebrowserruntimeai-container" className="z-100 leading-1em fixed bottom-0 right-10 m-5 flex select-none font-sans">
      <Toaster />
    </div>
  )
}
