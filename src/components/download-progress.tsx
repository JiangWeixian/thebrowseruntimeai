import { toast } from 'sonner'

import { Button } from './ui/button'
import { Progress } from '~/components/ui/progress'
import { useBearStore } from '~/hooks/use-store'

export const DownloadProgress = () => {
  const { progress } = useBearStore()
  return (
    <div className="flex h-fit w-full flex-col gap-2">
      {
        Object.keys(progress).map((key) => {
          const { metadata, progress: value } = progress[key]
          return (
            <div key={metadata.file} className="mt-4 flex flex-col gap-2">
              <small className="text-sm font-medium leading-none text-foreground">{metadata.file}</small>
              <Progress value={Math.round(value)} />
            </div>
          )
        })
      }
      <div className="mt-2 flex w-full justify-end">
        <Button size="sm" variant="outline" onClick={() => toast.dismiss()}>Dismiss all</Button>
      </div>
    </div>
  )
}
