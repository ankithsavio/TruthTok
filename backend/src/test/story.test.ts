import request from 'supertest'
import { createAuthenticatedRequest, setupTestServer } from './utils'
import { prismaMock } from './setup'
import type { Express } from 'express'

describe('Story API', () => {
  let app: Express
  let authenticatedRequest: {
    get: (url: string) => request.Test;
    post: (url: string) => request.Test;
    put: (url: string) => request.Test;
    delete: (url: string) => request.Test;
  };

  beforeAll(async () => {
    app = await setupTestServer()
    authenticatedRequest = await createAuthenticatedRequest(app)
  })

  describe('GET /api/stories', () => {
    it('should return stories near location', async () => {
      const mockStories = [
        {
          id: 'story-1',
          title: 'Test Story',
          description: 'Test Description',
          centerLocation: { lat: 51.5074, lng: -0.1278 },
          radiusKm: 1,
          timeStart: new Date(),
          timeEnd: new Date(),
          story: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      prismaMock.cluster.findMany.mockResolvedValue(mockStories)

      const response = await authenticatedRequest
        .get('/api/stories')
        .query({
          lat: 51.5074,
          lng: -0.1278,
          radius: 5
        })

      expect(response.status).toBe(200)
      expect(response.body.stories).toHaveLength(1)
      expect(response.body.stories[0]).toHaveProperty('id', 'story-1')
    })

    it('should validate location parameters', async () => {
      const response = await authenticatedRequest
        .get('/api/stories')
        .query({
          lat: 'invalid',
          lng: -0.1278,
          radius: 5
        })

      expect(response.status).toBe(400)
    })
  })
}) 