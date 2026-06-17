import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Simple PrismaClient initialization
// Prisma will use the connection URL from prisma.config.ts
export const prisma = (() => {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  try {
    const client = new PrismaClient()
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = client
    }
    return client
  } catch (e) {
    console.error('Failed to create PrismaClient:', e)
    // Return a mock client that will fail gracefully
    return new PrismaClient()
  }
})()
