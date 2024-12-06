import { Client as MinioClient, CopyConditions } from 'minio'

export class StorageService {
  constructor(private minio: MinioClient) {}

  async createVideoUploadUrl(videoId: string): Promise<string> {
    const policy = {
      'Content-Type': 'video/webm'
    }
    return new Promise((resolve, reject) => {
      this.minio.presignedPutObject('videos', `raw/${videoId}`, 3600, (err, url) => { // removed policy
        if (err) reject(err)
        else resolve(url)
      })
    })
  }

  async moveToProcessed(videoId: string): Promise<void> {
    const conditions = new CopyConditions()
    // conditions.setContentType('video/webm')

    await this.minio.copyObject(
      'videos-processed',
      `${videoId}`,
      `/videos/raw/${videoId}`,
      conditions
    )
  }

  async moveToArchive(videoId: string, age: number): Promise<void> {
    if (age > 30) {
      const conditions = new CopyConditions()
      // conditions.setContentType('video/webm')
      // conditions.setStorageClass('GLACIER')

      await this.minio.copyObject(
        'videos-archive',
        `${videoId}`,
        `/videos-processed/${videoId}`,
        conditions
      )
    }
  }
} 