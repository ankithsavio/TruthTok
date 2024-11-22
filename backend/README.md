# TruthTok Backend

A scalable backend service for processing, analyzing, and serving real-world news videos.

## Architecture Overview

The system consists of several interconnected services:

- API Server (Express.js)
- Video Storage (MinIO)
- Database (PostgreSQL)
- Cache Layer (Redis)
- Message Queue (RabbitMQ)
- AI Processing (OpenAI Vision)

## Getting Started

### Prerequisites

- Docker and Docker Compose
- OpenAI API key

### Quick Start

1. Clone the repository
2. Copy environment configuration: cp .env.example .env
3. Update .env with your OpenAI API key
4. Start the development environment: ./dev.sh

### Development Workflow

Start all services:
./dev.sh

View logs:
docker compose logs -f backend

Access services:
- Backend API: http://localhost:3001
- MinIO Console: http://localhost:9001
- RabbitMQ Management: http://localhost:15672

## API Endpoints

### Video Upload
POST /api/videos/upload

Request:
{
  location: {
    lat: number,
    lng: number
  }
}

Response:
{
  uploadUrl: string,
  videoId: string
}

### Video Status
GET /api/videos/:id/status

Response:
{
  status: 'uploading' | 'processing' | 'ready' | 'failed',
  progress?: number
}

### Get Stories
GET /api/stories

Query Parameters:
- lat: number
- lng: number
- radius: number (km)
- limit: number
- offset: number

Response:
{
  stories: [
    {
      id: string
      title: string
      description: string
      videos: [
        {
          id: string
          url: string
        }
      ]
      location: {
        lat: number
        lng: number
      }
      createdAt: string
    }
  ]
}

## Processing Pipeline

1. Video Upload
   - Client requests upload URL
   - Uploads directly to MinIO
   - Backend receives upload completion webhook

2. Processing
   - Video added to RabbitMQ queue
   - OpenAI analyzes video content
   - System generates description
   - Content is clustered by location and time

3. Story Generation
   - Related videos are grouped
   - AI generates comprehensive story
   - Story is cached for quick access

## Development Commands

Start development:
./dev.sh

View service logs:
docker compose logs -f [service-name]

Database commands:
docker compose exec backend npx prisma studio
docker compose exec backend npx prisma migrate dev

Stop all services:
docker compose down

Reset everything:
docker compose down -v

## Monitoring

Health check: GET /health
RabbitMQ Console: http://localhost:15672
MinIO Console: http://localhost:9001

## License

MIT License