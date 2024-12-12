import { VideoStatus } from '@prisma/client'
import { VideoProcessor } from '../services/video/videoProcessor'
import { dbService } from '../services/db'
import { jest } from '@jest/globals'
import { closeQueues } from '../services/video/videoProcessor'

jest.mock('../services/db')
jest.mock('minio')
jest.mock('openai')
jest.mock('fluent-ffmpeg')

describe('VideoProcessor', () => {
  let processor: VideoProcessor

  beforeEach(() => {
    processor = new VideoProcessor()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await closeQueues()
  })

  describe('queueVideoProcessing', () => {
    it('should queue a video for processing', async () => {
      const mockVideo = {
        id: 'test-video-id',
        userId: 'test-user-id',
        url: 'http://example.com/video.mp4',
        status: VideoStatus.PENDING,
        timestamp: new Date(),
        location: null,
        description: null,
        aiDescription: null,
        clusterId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      jest.spyOn(dbService, 'getVideoById').mockResolvedValue(mockVideo)
      jest.spyOn(dbService, 'updateVideoStatus').mockResolvedValue({
        ...mockVideo,
        status: VideoStatus.PROCESSED
      })

      await processor.queueVideoProcessing(mockVideo.id, mockVideo.userId)
      
      expect(dbService.updateVideoStatus).toHaveBeenCalledWith(
        mockVideo.id,
        VideoStatus.PROCESSING
      )
    })

    it('should handle queue errors gracefully', async () => {
      const mockVideo = {
        id: 'error-video-id',
        userId: 'test-user-id'
      }

      jest.spyOn(dbService, 'updateVideoStatus').mockRejectedValue(new Error('Queue error'))

      await expect(
        processor.queueVideoProcessing(mockVideo.id, mockVideo.userId)
      ).rejects.toThrow('Queue error')

      expect(dbService.updateVideoStatus).toHaveBeenCalledWith(
        mockVideo.id,
        VideoStatus.FAILED
      )
    })
  })

  describe('processVideo', () => {
    const mockMetadata = {
      duration: 60,
      format: 'mp4',
      resolution: { width: 1920, height: 1080 },
      fileSize: 1024 * 1024
    }

    it('should process video with metadata successfully', async () => {
      const mockVideo = {
        id: 'test-video-id',
        userId: 'test-user-id',
        url: 'http://example.com/video.mp4',
        status: VideoStatus.PENDING
      }

      jest.spyOn(dbService, 'getVideoById').mockResolvedValue(mockVideo)
      jest.spyOn(dbService, 'updateVideoStatus').mockResolvedValue({
        ...mockVideo,
        status: VideoStatus.PROCESSED
      })
      jest.spyOn(dbService, 'createVideoMetadata').mockResolvedValue({
        id: 'metadata-id',
        videoId: mockVideo.id,
        ...mockMetadata,
        processingLogs: [],
        createdAt: new Date(),
        updatedAt: new Date()
      })

      await processor.processVideo(mockVideo.id)

      expect(dbService.updateVideoStatus).toHaveBeenCalledWith(
        mockVideo.id,
        VideoStatus.PROCESSED
      )
      expect(dbService.createVideoMetadata).toHaveBeenCalledWith(
        mockVideo.id,
        expect.objectContaining(mockMetadata)
      )
    })

    it('should handle video not found error', async () => {
      jest.spyOn(dbService, 'getVideoById').mockResolvedValue(null)

      await expect(
        processor.processVideo('non-existent-id')
      ).rejects.toThrow('Video not found')

      expect(dbService.updateVideoStatus).toHaveBeenCalledWith(
        'non-existent-id',
        VideoStatus.FAILED
      )
    })

    it('should handle metadata extraction errors', async () => {
      const mockVideo = {
        id: 'test-video-id',
        userId: 'test-user-id',
        url: 'http://example.com/corrupt.mp4',
        status: VideoStatus.PENDING
      }

      jest.spyOn(dbService, 'getVideoById').mockResolvedValue(mockVideo)
      jest.spyOn(dbService, 'createVideoMetadata').mockRejectedValue(
        new Error('Metadata extraction failed')
      )

      await expect(
        processor.processVideo(mockVideo.id)
      ).rejects.toThrow('Metadata extraction failed')

      expect(dbService.updateVideoStatus).toHaveBeenCalledWith(
        mockVideo.id,
        VideoStatus.FAILED
      )
    })
  })
})
