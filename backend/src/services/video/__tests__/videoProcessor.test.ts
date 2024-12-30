import { VideoProcessor } from '../videoProcessor'
import { PrismaClient, VideoStatus } from '@prisma/client'
import { mockDeep } from 'jest-mock-extended'

jest.mock('bull')
jest.mock('minio')
jest.mock('openai')

const mockPrisma = mockDeep<PrismaClient>()

describe('VideoProcessor', () => {
  let videoProcessor: VideoProcessor

  beforeEach(() => {
    jest.clearAllMocks()
    videoProcessor = new VideoProcessor(mockPrisma)
  })

  const mockVideo = {
    id: 'video-123',
    userId: 'user-123',
    url: 'test-url',
    location: { latitude: 0, longitude: 0 },
    timestamp: new Date(),
    status: VideoStatus.PENDING,
    description: null,
    aiDescription: null,
    clusterId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  describe('processVideo', () => {
    it('should process video successfully', async () => {
      mockPrisma.video.findUnique.mockResolvedValue(mockVideo)
      mockPrisma.video.update.mockResolvedValue({
        ...mockVideo,
        status: VideoStatus.PROCESSED
      })

      await videoProcessor.processVideo(mockVideo.id)

      expect(mockPrisma.video.update).toHaveBeenCalledWith({
        where: { id: mockVideo.id },
        data: { status: VideoStatus.PROCESSED }
      })
    })

    it('should handle video not found', async () => {
      mockPrisma.video.findUnique.mockResolvedValue(null)

      await expect(videoProcessor.processVideo('nonexistent-id')).rejects.toThrow('Video not found')
    })
  })

  describe('generateCaptions', () => {
    it('should generate captions successfully', async () => {
      mockPrisma.video.findUnique.mockResolvedValue(mockVideo)
      mockPrisma.video.update.mockResolvedValue({
        ...mockVideo,
        description: 'Test captions'
      })

      await videoProcessor.generateCaptions(mockVideo.id)

      expect(mockPrisma.video.update).toHaveBeenCalled()
    })
  })

  describe('generateDescription', () => {
    it('should generate AI description successfully', async () => {
      mockPrisma.video.findUnique.mockResolvedValue(mockVideo)
      mockPrisma.video.update.mockResolvedValue({
        ...mockVideo,
        aiDescription: 'AI generated description'
      })

      await videoProcessor.generateDescription(mockVideo.id)

      expect(mockPrisma.video.update).toHaveBeenCalled()
    })
  })
})
