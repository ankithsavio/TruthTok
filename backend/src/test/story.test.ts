import request from 'supertest'
import app from '../app'
import { dbService } from '../services/db'
import { jest } from '@jest/globals'

jest.mock('../services/db')

describe('Story API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/stories', () => {
    const validStoryData = {
      userId: 'test-user',
      videoId: 'test-video',
      location: {
        latitude: 40.7128,
        longitude: -74.0060
      }
    }

    it('should create a story successfully', async () => {
      const mockStory = {
        id: 'test-story-id',
        ...validStoryData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      jest.spyOn(dbService, 'createStory').mockResolvedValue(mockStory)

      const response = await request(app)
        .post('/api/stories')
        .send(validStoryData)

      expect(response.status).toBe(201)
      expect(response.body).toEqual(expect.objectContaining({
        id: mockStory.id,
        userId: validStoryData.userId,
        videoId: validStoryData.videoId,
        location: validStoryData.location
      }))
      expect(dbService.createStory).toHaveBeenCalledWith(validStoryData)
    })

    it('should reject invalid story data', async () => {
      const invalidData = {
        userId: 'test-user'
        // Missing required fields
      }

      const response = await request(app)
        .post('/api/stories')
        .send(invalidData)

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
      expect(dbService.createStory).not.toHaveBeenCalled()
    })

    it('should handle database errors', async () => {
      jest.spyOn(dbService, 'createStory').mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .post('/api/stories')
        .send(validStoryData)

      expect(response.status).toBe(500)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/stories', () => {
    const mockStories = [
      {
        id: 'story-1',
        userId: 'test-user',
        videoId: 'test-video-1',
        location: {
          latitude: 40.7128,
          longitude: -74.0060
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'story-2',
        userId: 'test-user',
        videoId: 'test-video-2',
        location: {
          latitude: 40.7129,
          longitude: -74.0061
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    it('should get stories by location', async () => {
      jest.spyOn(dbService, 'getStoriesByLocation').mockResolvedValue(mockStories)

      const response = await request(app)
        .get('/api/stories')
        .query({
          latitude: 40.7128,
          longitude: -74.0060,
          radius: 1000 // 1km radius
        })

      expect(response.status).toBe(200)
      expect(response.body).toEqual(expect.arrayContaining(
        mockStories.map(story => expect.objectContaining({
          id: story.id,
          userId: story.userId,
          videoId: story.videoId,
          location: story.location
        }))
      ))
      expect(dbService.getStoriesByLocation).toHaveBeenCalledWith(
        40.7128,
        -74.0060,
        1000
      )
    })

    it('should handle invalid location parameters', async () => {
      const response = await request(app)
        .get('/api/stories')
        .query({
          latitude: 'invalid',
          longitude: -74.0060,
          radius: 1000
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
      expect(dbService.getStoriesByLocation).not.toHaveBeenCalled()
    })

    it('should handle database errors in location search', async () => {
      jest.spyOn(dbService, 'getStoriesByLocation').mockRejectedValue(
        new Error('Database error')
      )

      const response = await request(app)
        .get('/api/stories')
        .query({
          latitude: 40.7128,
          longitude: -74.0060,
          radius: 1000
        })

      expect(response.status).toBe(500)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/stories/:id', () => {
    const mockStory = {
      id: 'test-story-id',
      userId: 'test-user',
      videoId: 'test-video',
      location: {
        latitude: 40.7128,
        longitude: -74.0060
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    it('should get a story by id', async () => {
      jest.spyOn(dbService, 'getStoryById').mockResolvedValue(mockStory)

      const response = await request(app)
        .get(`/api/stories/${mockStory.id}`)

      expect(response.status).toBe(200)
      expect(response.body).toEqual(expect.objectContaining({
        id: mockStory.id,
        userId: mockStory.userId,
        videoId: mockStory.videoId,
        location: mockStory.location
      }))
      expect(dbService.getStoryById).toHaveBeenCalledWith(mockStory.id)
    })

    it('should return 404 for non-existent story', async () => {
      jest.spyOn(dbService, 'getStoryById').mockResolvedValue(null)

      const response = await request(app)
        .get('/api/stories/non-existent-id')

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('error')
      expect(dbService.getStoryById).toHaveBeenCalledWith('non-existent-id')
    })

    it('should handle database errors in story retrieval', async () => {
      jest.spyOn(dbService, 'getStoryById').mockRejectedValue(
        new Error('Database error')
      )

      const response = await request(app)
        .get(`/api/stories/${mockStory.id}`)

      expect(response.status).toBe(500)
      expect(response.body).toHaveProperty('error')
    })
  })
})