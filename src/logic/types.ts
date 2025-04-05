export interface ProgressData {
  id: string
  progress: number
  type: 'downloading'
  metadata: {
    file: string
    model: string
    taskName: string
    url: string
  }
}

export type Message = {
  type: 'downloaded'
  payload: {}
} | {
  type: 'get-readable-text'
  payload: {}
} | {
  type: 'initializing'
  payload: {}
} | {
  type: 'notification'
  payload: {
    level: 'error' | 'success' | 'warning'
    message: string
  }
} | {
  type: 'progress'
  payload: ProgressData
}
