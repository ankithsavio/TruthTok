import request from 'supertest'
import app from '../app'
import { dbService } from '../services/db'
import { VideoStatus } from '@prisma/client'
import { jest } from '@jest/globals'

jest.mock('../services/db')

describe('Video Location API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/videos/location', () => {
    const mockLocation = {
      latitude: 40.7128,
      longitude: -74.0060
    }

    const mockVideo = {
      id: 'test-video-id',
      userId: 'test-user-id',
      url: 'http://example.com/video.mp4',
      location: { lat: mockLocation.latitude, lng: mockLocation.longitude },
      timestamp: new Date(),
      status: VideoStatus.PROCESSED,
      description: null,
      aiDescription: null,
      clusterId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    it('should create a video with location', async () => {
      jest.spyOn(dbService, 'createVideo').mockResolvedValue(mockVideo)

      const response = await request(app)
        .post('/api/videos/location')
        .send({
          userId: 'test-user-id',
          url: 'http://example.com/video.mp4',
          location: mockLocation
        })

      expect(response.status).toBe(201)
      expect(response.body).toEqual(expect.objectContaining({
        id: mockVideo.id,
        userId: mockVideo.userId,
        url: mockVideo.url,
        location: mockVideo.location
      }))
    })

    it('should handle missing location data', async () => {
      const response = await request(app)
        .post('/api/videos/location')
        .send({
          userId: 'test-user-id',
          url: 'http://example.com/video.mp4'
          // Missing location
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })

    it('should handle invalid location format', async () => {
      const response = await request(app)
        .post('/api/videos/location')
        .send({
          userId: 'test-user-id',
          url: 'http://example.com/video.mp4',
          location: {
            latitude: 'invalid',
            longitude: -74.0060
          }
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/videos/location', () => {
    const mockVideos = [
      {
        id: 'video-1',
        userId: 'test-user',
        url: 'http://example.com/video1.mp4',
        location: { lat: 40.7128, lng: -74.0060 },
        timestamp: new Date(),
        status: VideoStatus.PROCESSED,
        description: null,
        aiDescription: null,
        clusterId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'video-2',
        userId: 'test-user',
        url: 'http://example.com/video2.mp4',
        location: { lat: 40.7129, lng: -74.0061 },
        timestamp: new Date(),
        status: VideoStatus.PROCESSED,
        description: null,
        aiDescription: null,
        clusterId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    it('should get videos by location', async () => {
      jest.spyOn(dbService, 'getVideosByLocation').mockResolvedValue(mockVideos)

      const response = await request(app)
        .get('/api/videos/location')
        .query({
          latitude: 40.7128,
          longitude: -74.0060,
          radius: 1000 // 1km radius
        })

      expect(response.status).toBe(200)
      expect(response.body).toEqual(expect.arrayContaining(
        mockVideos.map(video => expect.objectContaining({
          id: video.id,
          userId: video.userId,
          url: video.url,
          location: video.location
        }))
      ))
    })

    it('should handle invalid location parameters', async () => {
      const response = await request(app)
        .get('/api/videos/location')
        .query({
          latitude: 'invalid',
          longitude: -74.0060,
          radius: 1000
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })

    it('should handle missing parameters', async () => {
      const response = await request(app)
        .get('/api/videos/location')
        .query({
          // Missing parameters
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })
  })
})
