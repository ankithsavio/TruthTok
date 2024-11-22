import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

export const prisma = new PrismaClient()
export const prismaMock = mockDeep<PrismaClient>() as DeepMockProxy<PrismaClient>

beforeAll(async () => {
  await prisma.$connect()
})

afterAll(async () => {
  await prisma.$disconnect()
})

beforeEach(async () => {
  await prisma.$transaction([
    prisma.$executeRaw`TRUNCATE TABLE "Video" CASCADE`,
    prisma.$executeRaw`TRUNCATE TABLE "Cluster" CASCADE`,
    prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`
  ])
  mockReset(prismaMock)
}) 