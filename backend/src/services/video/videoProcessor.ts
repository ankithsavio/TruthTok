import { PrismaClient, Video, VideoStatus } from '@prisma/client'
import { Client as MinioClient } from 'minio'
import Bull from 'bull'
import ffmpeg from 'fluent-ffmpeg'
import { OpenAI } from 'openai'
import env from '../../config/env'

const prisma = new PrismaClient()
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

interface VideoMetadata {
  duration: number
  format: string
  resolution: {
    width: number
    height: number
  }
  fileSize: number
}

// Initialize queues
const videoProcessingQueue = new Bull('video-processing', {
  redis: env.REDIS_URL,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
})

const captionGenerationQueue = new Bull('caption-generation', {
  redis: env.REDIS_URL,
})

const descriptionGenerationQueue = new Bull('description-generation', {
  redis: env.REDIS_URL,
})

interface VideoProcessingJob {
  videoId: string
  userId: string
}

class VideoProcessor {
  private minio: MinioClient

  constructor() {
    this.minio = new MinioClient({
      endPoint: env.MINIO_ENDPOINT,
      port: parseInt(env.MINIO_PORT),
      useSSL: env.MINIO_USE_SSL === 'true',
      accessKey: env.MINIO_ROOT_USER,
      secretKey: env.MINIO_ROOT_PASSWORD,
    })
    this.initializeQueues()
  }

  private async initializeQueues() {
    // Process video uploads
    videoProcessingQueue.process(async (job) => {
      const { videoId, userId } = job.data as VideoProcessingJob
      try {
        await this.processVideo(videoId)
      } catch (error) {
        console.error(`Error processing video ${videoId}:`, error)
        await prisma.video.update({
          where: { id: videoId },
          data: { status: VideoStatus.FAILED },
        })
        throw error
      }
    })

    // Generate captions
    captionGenerationQueue.process(async (job) => {
      const { videoId } = job.data
      await this.generateCaptions(videoId)
    })

    // Generate AI descriptions
    descriptionGenerationQueue.process(async (job) => {
      const { videoId } = job.data
      await this.generateDescription(videoId)
    })
  }

  async processVideo(videoId: string): Promise<void> {
    // Update status to processing
    await prisma.video.update({
      where: { id: videoId },
      data: { status: VideoStatus.PROCESSING },
    })

    const video = await prisma.video.findUnique({
      where: { id: videoId },
    })

    if (!video) {
      throw new Error('Video not found')
    }

    // Get video metadata
    const metadata = await this.extractVideoMetadata(video.url)
    await prisma.videoMetadata.create({
      data: {
        videoId,
        duration: metadata.duration,
        format: metadata.format,
        resolution: metadata.resolution,
        fileSize: metadata.fileSize,
        processingLogs: [],
      },
    })

    // Queue caption and description generation
    await captionGenerationQueue.add({ videoId })
    await descriptionGenerationQueue.add({ videoId })

    // Update status to processed
    await prisma.video.update({
      where: { id: videoId },
      data: { status: VideoStatus.PROCESSED },
    })
  }

  private extractVideoMetadata(videoUrl: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoUrl, (err, metadata) => {
        if (err) reject(err)
        const videoStream = metadata.streams.find(s => s.codec_type === 'video')
        resolve({
          duration: metadata.format.duration || 0,
          format: videoStream?.codec_name || 'unknown',
          resolution: {
            width: videoStream?.width || 0,
            height: videoStream?.height || 0,
          },
          fileSize: metadata.format.size || 0,
        })
      })
    })
  }

  private async generateCaptions(videoId: string): Promise<void> {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    })

    if (!video) {
      throw new Error('Video not found')
    }

    try {
      const response = await fetch(video.url)
      const blob = await response.blob()
      const file = new File([blob], 'video.mp4', { type: 'video/mp4' })

      const transcription = await openai.audio.transcriptions.create({
        file,
        model: "whisper-1",
        response_format: "verbose_json"
      })

      if (transcription.segments) {
        for (const segment of transcription.segments) {
          await prisma.caption.create({
            data: {
              videoId,
              text: segment.text,
              startTime: segment.start,
              endTime: segment.end,
            },
          })
        }
      }
    } catch (error) {
      console.error(`Error generating captions for video ${videoId}:`, error)
      throw error
    }
  }

  private async generateDescription(videoId: string): Promise<void> {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: { captions: true },
    })

    if (!video) {
      throw new Error('Video not found')
    }

    try {
      const captionText = video.captions.map(c => c.text).join(' ')
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Generate a concise, engaging description for a video based on its transcription."
          },
          {
            role: "user",
            content: `Generate a description for this video transcription: ${captionText}`
          }
        ]
      })

      const aiDescription = completion.choices[0].message.content

      await prisma.video.update({
        where: { id: videoId },
        data: { aiDescription },
      })
    } catch (error) {
      console.error(`Error generating AI description for video ${videoId}:`, error)
      throw error
    }
  }

  async queueVideoProcessing(videoId: string, userId: string): Promise<void> {
    await videoProcessingQueue.add({ videoId, userId })
  }
}

export { VideoProcessor }
export const videoProcessor = new VideoProcessor()

// Add cleanup function for tests
export const closeQueues = async () => {
  await Promise.all([
    videoProcessingQueue.close(),
    captionGenerationQueue.close(),
    descriptionGenerationQueue.close()
  ])
}
