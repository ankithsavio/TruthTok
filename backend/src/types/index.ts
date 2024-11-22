export interface Metrics {
  videosProcessing: number
  averageProcessingTime: number
  queueLength: number
  storageUsage: number
}

export interface Message {
  content: Buffer
  properties: any
  fields: any
} 