import Redis from 'ioredis'

export interface Metrics {
  videosProcessing: number
  averageProcessingTime: number
  queueLength: number
  storageUsage: number
}

export class MonitoringService {
  constructor(
    private readonly redis: Redis,
    private readonly queueService: any,
    private readonly storageService: any
  ) {}

  async trackProcessingTime(videoId: string, duration: number) {
    const timestamp = Date.now()
    await this.redis.call(
      'TS.ADD',
      `processing:${videoId}`,
      timestamp,
      duration.toString()
    )
  }

  async getSystemMetrics(): Promise<Metrics> {
    const processingCount = await this.redis.call(
      'TS.INFO',
      'processing:*'
    ) as any

    const avgTime = await this.getAverageProcessingTime()
    
    return {
      videosProcessing: processingCount?.totalSamples || 0,
      averageProcessingTime: avgTime,
      queueLength: await this.getQueueLength(),
      storageUsage: await this.getStorageUsage()
    }
  }

  private async getQueueLength(): Promise<number> {
    // Implement queue length check
    return 0
  }

  private async getStorageUsage(): Promise<number> {
    // Implement storage usage check
    return 0
  }

  private async getAverageProcessingTime(): Promise<number> {
    const result = await this.redis.call(
      'TS.RANGE',
      'processing:*',
      '-',
      '+',
      'AGGREGATION',
      'avg',
      60000 // 1 minute aggregation
    ) as [number, string][]

    if (!result?.length) return 0

    const sum = result.reduce((acc, [_, value]) => acc + parseFloat(value), 0)
    return sum / result.length
  }
} 