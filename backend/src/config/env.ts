import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const envSchema = z.object({
  // Server
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  DATABASE_URL: z.string(),
  
  // MinIO
  MINIO_ROOT_USER: z.string(),
  MINIO_ROOT_PASSWORD: z.string(),
  MINIO_ENDPOINT: z.string(),
  MINIO_PORT: z.string().default('9000'),
  MINIO_USE_SSL: z.string().default('false'),
  MINIO_REGION: z.string().default('us-east-1'),

  // Redis
  REDIS_URL: z.string(),
  
  // RabbitMQ
  RABBITMQ_URL: z.string(),

  // AI Services
  OPENAI_API_KEY: z.string(),
  OPENAI_MODEL: z.string().default('gpt-4-vision-preview'),
  
  // JWT
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('7d'),
})

const env = envSchema.parse(process.env)

export default env 