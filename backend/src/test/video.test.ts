import request from 'supertest'
import app from '../app'
import { VideoStatus } from '@prisma/client'
import path from 'path'
import { dbService } from '../services/db'

describe('Video API', () => {
  describe('POST /api/videos/upload', () => {
    it('should upload a video successfully', async () => {
      const response = await request(app)
        .post('/api/videos/upload')
        .attach('video', path.join(__dirname, '__fixtures__/test-video.mp4'))
        .field('location', JSON.stringify({
          latitude: 40.7128,
          longitude: -74.0060
        }))

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('videoId')
    })

    it('should reject invalid video formats', async () => {
      const response = await request(app)
        .post('/api/videos/upload')
        .attach('video', path.join(__dirname, '__fixtures__/invalid.txt'))

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/videos/:id/status', () => {
    it('should get video processing status', async () => {
      // Create a test video first
      const video = await dbService.createVideo(
        'test-user',
        'http://example.com/video.mp4',
        {
          latitude: 40.7128,
          longitude: -74.0060
        }
      )

      const response = await request(app)
        .get(`/api/videos/${video.id}/status`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('status')
      expect(response.body.status).toBe(VideoStatus.PENDING)
    })

    it('should return 404 for non-existent video', async () => {
      const response = await request(app)
        .get('/api/videos/non-existent-id/status')

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('error')
    })
  })
})