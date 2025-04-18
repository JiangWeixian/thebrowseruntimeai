declare const __DEV__: boolean

interface Window {
  __THEBROWSERRUNTIMEAI__: {
    success: (message: string) => void
    error: (message: string) => void
    test: () => void
  }
}

declare module 'turndown-plugin-gfm'
