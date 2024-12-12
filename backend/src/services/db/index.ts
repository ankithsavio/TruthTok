import { PrismaClient, VideoStatus } from '@prisma/client'
import { JsonValue } from '@prisma/client/runtime/library'

export class DatabaseService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  // Video-related methods
  async createVideo(
    userId: string,
    url: string,
    location?: { latitude: number; longitude: number }
  ) {
    return this.prisma.video.create({
      data: {
        userId,
        url,
        location: location ? { lat: location.latitude, lng: location.longitude } : undefined,
        timestamp: new Date(),
        status: VideoStatus.PENDING,
      },
    })
  }

  async getVideoById(id: string) {
    return this.prisma.video.findUnique({
      where: { id },
    })
  }

  async updateVideoStatus(id: string, status: VideoStatus) {
    return this.prisma.video.update({
      where: { id },
      data: { status },
    })
  }

  async getVideosByLocation(
    latitude: number,
    longitude: number,
    radiusInMeters: number
  ) {
    // Using PostGIS for location-based queries
    const point = `POINT(${longitude} ${latitude})`
    return this.prisma.$queryRaw`
      SELECT *
      FROM "Video"
      WHERE ST_DWithin(
        ST_SetSRID(ST_MakePoint(
          CAST(CAST(location->>'lng' AS TEXT) AS FLOAT),
          CAST(CAST(location->>'lat' AS TEXT) AS FLOAT)
        ), 4326)::geography,
        ST_SetSRID(ST_GeomFromText(${point}), 4326)::geography,
        ${radiusInMeters}
      )
    `
  }

  async findOldVideos(days: number) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return this.prisma.video.findMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    })
  }

  async getVideosPaginated(page: number, limit: number) {
    return this.prisma.video.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      where: {
        status: VideoStatus.PENDING
      }
    })
  }

  async createVideoMetadata(videoId: string, metadata: {
    duration: number
    format: string
    resolution: { width: number; height: number }
    fileSize: number
    processingLogs: string[]
  }) {
    return this.prisma.videoMetadata.create({
      data: {
        videoId,
        duration: metadata.duration,
        format: metadata.format,
        resolution: metadata.resolution as JsonValue,
        fileSize: metadata.fileSize,
        processingLogs: metadata.processingLogs as JsonValue[],
      },
    })
  }

  async createCaption(videoId: string, text: string, startTime: number, endTime: number) {
    return this.prisma.caption.create({
      data: {
        videoId,
        text,
        startTime,
        endTime
      }
    })
  }

  // Story-related methods
  async createStory(data: {
    userId: string
    videoId: string
    location: { latitude: number; longitude: number }
  }) {
    return this.prisma.video.create({
      data: {
        userId: data.userId,
        url: data.videoId,
        location: { lat: data.location.latitude, lng: data.location.longitude },
        timestamp: new Date(),
        status: VideoStatus.PENDING,
        description: null,
        aiDescription: null,
        clusterId: null,
      },
    })
  }

  async getStoryById(id: string) {
    return this.prisma.video.findUnique({
      where: { id },
    })
  }

  async getStoriesByLocation(
    latitude: number,
    longitude: number,
    radiusInMeters: number
  ) {
    const point = `POINT(${longitude} ${latitude})`
    return this.prisma.$queryRaw`
      SELECT *
      FROM "Video"
      WHERE ST_DWithin(
        ST_SetSRID(ST_MakePoint(
          CAST(CAST(location->>'lng' AS TEXT) AS FLOAT),
          CAST(CAST(location->>'lat' AS TEXT) AS FLOAT)
        ), 4326)::geography,
        ST_SetSRID(ST_GeomFromText(${point}), 4326)::geography,
        ${radiusInMeters}
      )
    `
  }

  async disconnect() {
    await this.prisma.$disconnect()
  }
}

export const dbService = new DatabaseService()