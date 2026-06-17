#!/bin/bash
set -e

echo "=== Starting build ==="

if [ "$VERCEL" = "1" ]; then
  echo "Running on Vercel, using PostgreSQL"
  cp prisma/schema.production.prisma prisma/schema.prisma
else
  echo "Running locally, using SQLite"
fi

echo "=== Generating Prisma client ==="
npx prisma generate

echo "=== Pushing database schema ==="
npx prisma db push --accept-data-loss || echo "Warning: db push failed"

echo "=== Building Next.js ==="
npx next build

echo "=== Build complete ==="
