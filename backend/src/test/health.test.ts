import request from 'supertest'
import { setupTestServer } from './utils'
import type { Express } from 'express'

describe('Health Check', () => {
  let app: Express

  beforeAll(async () => {
    app = await setupTestServer()
  })

  it('should return 200 for health check', async () => {
    const response = await request(app).get('/health')
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok' })
  })
}) 