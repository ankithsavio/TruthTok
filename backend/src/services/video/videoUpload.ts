import { PrismaClient, Video } from '@prisma/client'
import { Client as MinioClient } from 'minio'
import { v4 as uuidv4 } from 'uuid'
import { videoProcessor } from './videoProcessor'
import env from '../../config/env'

const prisma = new PrismaClient()

class VideoUploadService {
  private minio: MinioClient
  private readonly bucketName = 'videos'

  constructor() {
    this.minio = new MinioClient({
      endPoint: env.MINIO_ENDPOINT,
      port: parseInt(env.MINIO_PORT),
      useSSL: env.MINIO_USE_SSL === 'true',
      accessKey: env.MINIO_ROOT_USER,
      secretKey: env.MINIO_ROOT_PASSWORD,
    })
    this.initializeBucket()
  }

  private async initializeBucket(): Promise<void> {
    try {
      const exists = await this.minio.bucketExists(this.bucketName)
      if (!exists) {
        await this.minio.makeBucket(this.bucketName, env.MINIO_REGION)
      }
    } catch (error) {
      console.error('Error initializing MinIO bucket:', error)
      throw error
    }
  }

  async uploadVideo(
    file: Express.Multer.File,
    userId: string,
    location: { lat: number; lng: number },
    description?: string
  ): Promise<Video> {
    const objectName = `${uuidv4()}-${file.originalname}`
    
    try {
      // Upload to MinIO
      await this.minio.putObject(
        this.bucketName,
        objectName,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype }
      )

      // Generate presigned URL
      const url = await this.minio.presignedGetObject(this.bucketName, objectName, 24 * 60 * 60) // 24 hours

      // Create video record in database
      const video = await prisma.video.create({
        data: {
          url,
          userId,
          location,
          description,
          timestamp: new Date(),
          status: 'PENDING',
        },
      })

      // Queue video for processing
      await videoProcessor.queueVideoProcessing(video.id, userId)

      return video
    } catch (error) {
      console.error('Error uploading video:', error)
      throw error
    }
  }

  async getSignedUrl(objectName: string): Promise<string> {
    try {
      return await this.minio.presignedGetObject(this.bucketName, objectName, 24 * 60 * 60)
    } catch (error) {
      console.error('Error generating signed URL:', error)
      throw error
    }
  }
}

export const videoUploadService = new VideoUploadService()
