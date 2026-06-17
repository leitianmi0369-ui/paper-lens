#!/bin/bash

# Use PostgreSQL schema for production
if [ "$VERCEL" = "1" ]; then
  cp prisma/schema.production.prisma prisma/schema.prisma
fi

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Build Next.js
npx next build
