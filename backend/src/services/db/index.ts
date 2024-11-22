import { PrismaClient } from '@prisma/client'

export class DatabaseService {
  constructor(private prisma: PrismaClient) {}

  async getVideosPaginated(page: number, limit: number) {
    return await this.prisma.video.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      where: {
        status: 'ready'
      }
    })
  }

  async findOldVideos(days: number) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return await this.prisma.video.findMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    })
  }

  // Implement database partitioning
  async setupPartitions() {
    await this.prisma.$executeRaw`
      CREATE TABLE videos_partition OF videos
      FOR VALUES FROM ('2024-01-01') TO ('2024-12-31');
    `
  }
} 