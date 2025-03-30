import '~/style.css'
import 'sonner/dist/styles.css'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { onMessage } from 'webext-bridge/content-script'

import { Toaster } from '~/components/ui/sonner'

let toasted = false

export const App = () => {
  useEffect(() => {
    self.__THEBROWSERRUNTIMEAI__ = {
      success: (message: string) => {
        toast.success(message)
      },
    }
    onMessage('progress', (data) => {
      if (!toasted) {
        toast.success('downloading...')
        toasted = true
      }
      console.log('progress', data)
    })
  }, [])
  return (
    <div id="thebrowserruntimeai-container" className="z-100 leading-1em fixed bottom-0 right-10 m-5 flex select-none font-sans">
      <Toaster />
      <div className="r-0 absolute bottom-0 flex size-10 cursor-pointer rounded-full bg-teal-600 shadow" />
    </div>
  )
}
