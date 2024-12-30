import { Express } from 'express'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import env from '../../config/env'

export const createAuthenticatedRequest = (app: Express) => {
  const testUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  }

  const token = jwt.sign(testUser, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  })

  const agent = request.agent(app)
  agent.auth(token, { type: 'bearer' })
  return agent
}

export type AuthenticatedRequest = ReturnType<typeof createAuthenticatedRequest>
