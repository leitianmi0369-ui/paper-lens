import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // For production (Vercel with PostgreSQL)
  if (process.env.POSTGRES_PRISMA_URL) {
    return new PrismaClient({
      datasourceUrl: process.env.POSTGRES_PRISMA_URL,
    })
  }

  // For local development (SQLite)
  return new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || 'file:./prisma/dev.db',
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
