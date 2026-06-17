#!/bin/bash
set -e

echo "=== Starting build ==="

# Check if running on Vercel
if [ "$VERCEL" = "1" ]; then
  echo "Running on Vercel, using PostgreSQL schema"
  cp prisma/schema.production.prisma prisma/schema.prisma
else
  echo "Running locally, using SQLite schema"
fi

echo "=== Generating Prisma client ==="
npx prisma generate

echo "=== Pushing database schema ==="
npx prisma db push --accept-data-loss || echo "Warning: db push failed, continuing..."

echo "=== Building Next.js ==="
npx next build

echo "=== Build complete ==="
