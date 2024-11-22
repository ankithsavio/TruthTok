import express from 'express'
import { PrismaClient } from '@prisma/client'
import { Client as MinioClient } from 'minio'
import Redis from 'ioredis'
import amqp from 'amqplib'
import env from './config/env'

const app = express()
app.use(express.json())

// Initialize clients
const prisma = new PrismaClient()
const redis = new Redis(env.REDIS_URL)
const minio = new MinioClient({
  endPoint: env.MINIO_ENDPOINT,
  port: parseInt(env.MINIO_PORT),
  useSSL: env.MINIO_USE_SSL === 'true',
  accessKey: env.MINIO_ROOT_USER,
  secretKey: env.MINIO_ROOT_PASSWORD
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const port = env.PORT
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
}) 