import { Express } from 'express'
import express from 'express'
import request from 'supertest'
import { prisma } from './setup'
import jwt from 'jsonwebtoken'
import env from '../config/env'

export async function setupTestServer(): Promise<Express> {
  const app = express()
  // Add your middleware and routes here
  return app
}

export async function createTestUser() {
  return await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User'
    }
  })
}

function createTestJWT(userId: string): string {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  })
}

export async function createAuthenticatedRequest(app: Express) {
  const user = await createTestUser()
  const token = createTestJWT(user.id)
  
  return {
    get: (url: string) => 
      request(app)
        .get(url)
        .set('Authorization', `Bearer ${token}`),
    post: (url: string) => 
      request(app)
        .post(url)
        .set('Authorization', `Bearer ${token}`),
    put: (url: string) => 
      request(app)
        .put(url)
        .set('Authorization', `Bearer ${token}`),
    delete: (url: string) => 
      request(app)
        .delete(url)
        .set('Authorization', `Bearer ${token}`)
  }
} 