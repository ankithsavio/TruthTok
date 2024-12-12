#!/bin/sh

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 5

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Run tests
echo "Running tests..."
npm test
