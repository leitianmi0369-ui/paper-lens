import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createClient(): PrismaClient {
  // Check if we have PostgreSQL URL (production)
  const pgUrl = process.env.POSTGRES_PRISMA_URL

  if (pgUrl) {
    // Production: use PostgreSQL adapter
    try {
      // Use eval to hide from bundler
      const pg = eval('require')('pg')
      const adapterPg = eval('require')('@prisma/adapter-pg')
      const pool = new pg.Pool({ connectionString: pgUrl })
      const adapter = new adapterPg.PrismaPg(pool)
      return new PrismaClient({ adapter })
    } catch (e) {
      console.error('Failed to create PostgreSQL client:', e)
      return new PrismaClient()
    }
  }

  // Local: use SQLite adapter
  try {
    const adapterSqlite = eval('require')('@prisma/adapter-better-sqlite3')
    const adapter = new adapterSqlite.PrismaBetterSqlite3({
      url: 'file:./prisma/dev.db',
    })
    return new PrismaClient({ adapter })
  } catch (e) {
    console.error('Failed to create SQLite client:', e)
    return new PrismaClient()
  }
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
