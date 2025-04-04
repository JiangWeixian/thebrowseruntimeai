import '~/style.css'
import 'sonner/dist/styles.css'

import { useEffect } from 'react'
import { toast } from 'sonner'

import { DownloadProgress } from '~/components/dowload-progress'
import { Button } from '~/components/ui/button'
import { Toaster } from '~/components/ui/sonner'
import { useBearStore } from '~/hooks/use-store'

import type { ProgressData } from '~/logic/types'

let toastId: number | string | undefined

self.__THEBROWSERRUNTIMEAI__ = {
  success: (message: string) => {
    toast.success(message)
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
    browser.runtime.onMessage.addListener((_data, _sender, _sendResponse) => {
      const data = _data as unknown as ProgressData
      if (data.type !== 'initializing') {
        updateProgress(data.metadata.file, data)
      }
      if (!toastId) {
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
      return true
    })
    // onMessage('progress', (data) => {
    //   const progress = data.data as unknown as ProgressData
    //   if (progress.type !== 'initializing') {
    //     updateProgress(progress.metadata.file, progress)
    //   }
    //   if (!toastId) {
    //     toastId = toast(
    //       () => {
    //         return 'Downloading...'
    //       },
    //       {
    //         description: () => {
    //           return <DownloadProgress />
    //         },
    //         duration: Infinity,
    //       },
    //     )
    //   }
    //   // console.log('progress', data, progressStore)
    // })
  }, [updateProgress])
  return (
    <div id="thebrowserruntimeai-container" className="z-100 leading-1em fixed bottom-0 right-10 m-5 flex select-none font-sans">
      <Toaster />
    </div>
  )
}
