import { create } from 'zustand'

import type { ProgressData } from '~/logic/types'

interface BearStore {
  bears: number
  progress: Record<string, ProgressData>
  updateProgress: (id: string, progress: ProgressData) => void
  increasePopulation: () => void
  removeAllBears: () => void
}

export const useBearStore = create<BearStore>((set, get) => ({
  bears: 0,
  progress: {
  },
  updateProgress: (id, progress) => {
    if (id.includes('.json')) {
      return
    }
    const state = get()
    if (state.progress[id]?.progress === 100) {
      return
    }
    set(state => ({ progress: { ...state.progress, [id]: progress } }))
  },
  increasePopulation: () => set(state => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}))
