import { Client, CopyConditions } from 'minio'
import { config } from '../../config'

const minioClient = new Client({
  endPoint: config.minio.endPoint,
  port: config.minio.port,
  useSSL: config.minio.useSSL,
  accessKey: config.minio.accessKey,
  secretKey: config.minio.secretKey,
})

class StorageService {
  private client: Client

  constructor() {
    this.client = minioClient
  }

  async createVideoUploadUrl(videoId: string): Promise<string> {
    return this.client.presignedPutObject(config.minio.bucketName, `raw/${videoId}`, 3600)
  }

  async getVideoDownloadUrl(videoId: string): Promise<string> {
    return this.client.presignedGetObject(config.minio.bucketName, `raw/${videoId}`, 3600)
  }

  async moveToProcessed(videoId: string): Promise<void> {
    const conditions = new CopyConditions()
    await this.client.copyObject(
      config.minio.bucketName,
      `processed/${videoId}`,
      `/${config.minio.bucketName}/raw/${videoId}`,
      conditions
    )
  }

  async moveToArchive(videoId: string, age: number): Promise<void> {
    if (age > 30) {
      const conditions = new CopyConditions()
      await this.client.copyObject(
        config.minio.bucketName,
        `archive/${videoId}`,
        `/${config.minio.bucketName}/processed/${videoId}`,
        conditions
      )
    }
  }

  async deleteVideo(videoId: string): Promise<void> {
    try {
      await this.client.removeObject(config.minio.bucketName, `raw/${videoId}`)
      await this.client.removeObject(config.minio.bucketName, `processed/${videoId}`)
      await this.client.removeObject(config.minio.bucketName, `archive/${videoId}`)
    } catch (error) {
      console.error('Error deleting video:', error)
      throw error
    }
  }

  async ensureBucketExists(): Promise<void> {
    const exists = await this.client.bucketExists(config.minio.bucketName)
    if (!exists) {
      await this.client.makeBucket(config.minio.bucketName, config.minio.region)
    }
  }
}

export const storageService = new StorageService()

export const getSignedUrl = async (bucket: string, objectName: string): Promise<string> => {
  try {
    return await minioClient.presignedGetObject(bucket, objectName, 24 * 60 * 60)
  } catch (error) {
    console.error('Error generating signed URL:', error)
    throw error
  }
}

export const uploadFile = async (
  bucket: string,
  objectName: string,
  buffer: Buffer,
  size: number,
  contentType: string
): Promise<void> => {
  try {
    await minioClient.putObject(bucket, objectName, buffer, size, {
      'Content-Type': contentType,
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

export const copyObject = async (
  sourceBucket: string,
  sourceObject: string,
  destBucket: string,
  destObject: string,
  contentType: string
): Promise<void> => {
  const conditions = new CopyConditions()
  try {
    await minioClient.copyObject(destBucket, destObject, `/${sourceBucket}/${sourceObject}`, conditions)
  } catch (error) {
    console.error('Error copying object:', error)
    throw error
  }
}

export default minioClient