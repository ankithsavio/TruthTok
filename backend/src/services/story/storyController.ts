import { PrismaClient, Video } from '@prisma/client'
import { JsonValue } from '@prisma/client/runtime/library'

const prisma = new PrismaClient()

interface CreateStoryInput {
  userId: string
  videoId: string
  location: {
    latitude: number
    longitude: number
  }
}

class StoryController {
  async createStory(input: CreateStoryInput): Promise<Video> {
    return prisma.video.create({
      data: {
        userId: input.userId,
        url: '', // Will be updated by video processor
        location: input.location as JsonValue,
        timestamp: new Date(),
        status: 'PENDING',
        description: null,
        aiDescription: null,
        clusterId: null
      }
    })
  }

  async getStory(id: string): Promise<Video | null> {
    return prisma.video.findUnique({
      where: { id }
    })
  }

  async listStories(): Promise<Video[]> {
    return prisma.video.findMany({
      orderBy: { createdAt: 'desc' }
    })
  }

  async deleteStory(id: string): Promise<void> {
    await prisma.video.delete({
      where: { id }
    })
  }
}

export const storyController = new StoryController()
