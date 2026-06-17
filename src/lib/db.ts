import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // For production (Vercel with PostgreSQL)
  if (process.env.POSTGRES_PRISMA_URL) {
    const { Pool } = require('pg')
    const { PrismaPg } = require('@prisma/adapter-pg')

    const pool = new Pool({
      connectionString: process.env.POSTGRES_PRISMA_URL,
    })
    const adapter = new PrismaPg(pool)

    return new PrismaClient({ adapter })
  }

  // For local development (SQLite)
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
  })

  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
