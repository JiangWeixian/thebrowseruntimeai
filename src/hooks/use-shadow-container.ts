import { useEffect, useState } from 'react'

const root = () => {
  return document.querySelector('#thebrowserruntimeai')?.shadowRoot
}

export const useShadowContainer = () => {
  const [container, setContainer] = useState<any | null>(null)
  useEffect(() => {
    setContainer(root()?.querySelector('#thebrowserruntimeai-container') ?? document.body)
  }, [])

  return {
    container,
  }
}
