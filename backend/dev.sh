#!/bin/bash

# Ensure script fails on any error
set -e

# Start all services in development mode
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
until docker compose exec postgres pg_isready -U user -d reality_news; do
  sleep 2
done

# Run database migrations
docker compose exec backend npx prisma migrate dev

# Follow the backend logs
docker compose logs -f backend 