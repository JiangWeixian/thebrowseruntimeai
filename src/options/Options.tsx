import { Button } from '~/components/ui/button'

async function askPermission() {
  await browser.permissions.request({ permissions: ['trialML'] })
  await updateGranted()
}

async function updateGranted() {
  const granted = await browser.permissions.contains({
    permissions: ['trialML'],
  })
  document.body.classList.toggle('granted', granted)
}

export const Options = () => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background">
      <div className="w-fit">
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          This extension helps you experience the browser's built-in AI features.
        </p>
        <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
          <li>
            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
              image-to-text
            </code>
            allows you to right-click on images to generate image descriptions.
          </li>
          <li>
            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
              summarization
            </code>
            allows you to right-click on a page to generate a page summary, or select text to generate a text summary.
          </li>
        </ul>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          This extension requires the use of Firefox ML engine.
        </p>
        <Button className="mt-6" size="default" onClick={askPermission}>Grant ML permission</Button>
      </div>
    </div>
  )
}
