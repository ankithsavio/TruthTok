import request from 'supertest'
import { setupTestServer } from './utils'
import { prismaMock } from './setup'
import type { Express } from 'express'

describe('Video API', () => {
  let app: Express
  let authenticatedRequest: ReturnType<typeof createAuthenticatedRequest>

  beforeAll(async () => {
    app = await setupTestServer()
    authenticatedRequest = await createAuthenticatedRequest(app)
  })

  describe('POST /api/videos/upload', () => {
    it('should return upload URL when valid location provided', async () => {
      const response = await authenticatedRequest
        .post('/api/videos/upload')
        .send({
          location: {
            lat: 51.5074,
            lng: -0.1278
          }
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('uploadUrl')
      expect(response.body).toHaveProperty('videoId')
    })

    it('should reject invalid location data', async () => {
      const response = await authenticatedRequest
        .post('/api/videos/upload')
        .send({
          location: {
            lat: 'invalid',
            lng: -0.1278
          }
        })

      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/videos/:id/status', () => {
    it('should return video status', async () => {
      const videoId = 'test-video-id'
      
      prismaMock.video.findUnique.mockResolvedValue({
        id: videoId,
        status: 'processing',
        userId: 'test-user-id',
        url: 'test-url',
        location: { lat: 0, lng: 0 },
        timestamp: new Date(),
        description: null,
        clusterId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const response = await authenticatedRequest
        .get(`/api/videos/${videoId}/status`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('status', 'processing')
    })

    it('should return 404 for non-existent video', async () => {
      prismaMock.video.findUnique.mockResolvedValue(null)

      const response = await authenticatedRequest
        .get('/api/videos/non-existent-id/status')

      expect(response.status).toBe(404)
    })
  })
}) 