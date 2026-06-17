import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create a dynamic require function that bundlers can't analyze
const dynamicRequire = new Function('module', 'return require(module)')

function createPrismaClient(): PrismaClient {
  const isProduction = process.env.VERCEL === '1' || !!process.env.POSTGRES_PRISMA_URL

  if (isProduction) {
    // Production: PostgreSQL
    const pg = dynamicRequire('pg')
    const { PrismaPg } = dynamicRequire('@prisma/adapter-pg')
    const pool = new pg.Pool({
      connectionString: process.env.POSTGRES_PRISMA_URL,
    })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
  }

  // Local: SQLite
  const { PrismaBetterSqlite3 } = dynamicRequire('@prisma/adapter-better-sqlite3')
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
