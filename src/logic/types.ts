export interface ProgressData {
  id: string
  progress: number
  type: 'downloading' | 'initializing'
  metadata: {
    file: string
    model: string
    taskName: string
    url: string
  }
}
