import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'
import { closeQueues } from '../services/video/videoProcessor'
import { config } from 'dotenv'

// Load test environment variables
config({ path: '.env.test' })

// Mock Bull queue
jest.mock('bull', () => {
  const mockQueue = {
    process: jest.fn(),
    add: jest.fn().mockResolvedValue({ id: 'mock-job-id' }),
    close: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    getJob: jest.fn().mockResolvedValue(null),
    getJobs: jest.fn().mockResolvedValue([]),
    getJobCounts: jest.fn().mockResolvedValue({ waiting: 0, active: 0, completed: 0, failed: 0 }),
    pause: jest.fn().mockResolvedValue(undefined),
    resume: jest.fn().mockResolvedValue(undefined),
    clean: jest.fn().mockResolvedValue([]),
    empty: jest.fn().mockResolvedValue(undefined)
  }
  return jest.fn().mockImplementation(() => mockQueue)
})

// Mock Redis client
jest.mock('ioredis', () => {
  const mockRedis = {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    quit: jest.fn().mockResolvedValue('OK'),
    on: jest.fn(),
    once: jest.fn(),
    emit: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    publish: jest.fn()
  }
  return jest.fn().mockImplementation(() => mockRedis)
})

// Mock MinIO client
jest.mock('minio', () => {
  const mockMinio = {
    putObject: jest.fn().mockImplementation((bucket, name, stream) => Promise.resolve()),
    getObject: jest.fn().mockImplementation(() => Promise.resolve(Buffer.from(''))),
    removeObject: jest.fn().mockImplementation(() => Promise.resolve()),
    bucketExists: jest.fn().mockResolvedValue(true),
    makeBucket: jest.fn().mockResolvedValue(undefined)
  }
  return { Client: jest.fn(() => mockMinio) }
})

export const prisma = new PrismaClient()
export const prismaMock = mockDeep<PrismaClient>() as DeepMockProxy<PrismaClient>

beforeAll(async () => {
  await prisma.$connect()
})

beforeEach(() => {
  mockReset(prismaMock)
  jest.clearAllMocks()
})

afterAll(async () => {
  await prisma.$disconnect()
  await closeQueues()
})