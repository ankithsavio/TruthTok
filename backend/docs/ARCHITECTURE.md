# TruthTok Technical Architecture

## System Architecture Overview

TruthTok is built as a microservices-based system designed for high scalability and reliability. The architecture is composed of several independent services that work together to provide video processing, storage, and AI-powered content analysis.

## Core Components

### 1. API Service (Node.js/Express)

The API service is the primary entry point for client applications. It handles:
- Authentication and authorization
- Request validation and routing
- Rate limiting and security
- Video upload coordination
- Metadata management

Key Features:
- Horizontally scalable
- JWT-based authentication
- Rate limiting with Redis
- Input validation with Zod
- OpenAPI documentation

### 2. Video Processing Service

Dedicated service for video processing tasks:
- Video format validation
- Metadata extraction
- Thumbnail generation
- Transcoding (if needed)
- Storage management

Technologies:
- FFmpeg for video processing
- Bull for job queues
- MinIO for object storage
- RabbitMQ for service communication

### 3. AI Processing Pipeline

Handles all AI-related tasks:
- Video description generation
- Caption generation
- Tag extraction
- Content clustering

Components:
- OpenAI integration for descriptions
- Bull queues for task management
- Async processing architecture
- Failure handling and retries

## Data Storage

### 1. PostgreSQL Database

Primary database for structured data:
- User information
- Video metadata
- Relationships
- Captions and tags

Schema Design:
```
User
 ├── id (UUID)
 ├── email
 ├── name
 └── videos (1:N)

Video
 ├── id (UUID)
 ├── url
 ├── userId
 ├── location (JSON)
 ├── timestamp
 ├── status
 ├── description
 ├── aiDescription
 ├── captions (1:N)
 ├── tags (N:M)
 └── metadata (1:1)

VideoMetadata
 ├── id (UUID)
 ├── videoId
 ├── duration
 ├── format
 ├── size
 ├── width
 ├── height
 ├── fps
 ├── codec
 └── bitrate

Caption
 ├── id (UUID)
 ├── videoId
 ├── text
 ├── startTime
 └── endTime

Tag
 ├── id (UUID)
 ├── name
 └── videos (N:M)

Cluster
 ├── id (UUID)
 ├── centerLocation
 ├── radiusKm
 ├── timeStart
 ├── timeEnd
 ├── story
 └── videos (1:N)
```

### 2. MinIO Object Storage

Handles binary video storage:
- Scalable object storage
- S3-compatible API
- Configurable retention policies
- Access control
- Versioning support

### 3. Redis Cache

Used for:
- Session management
- Rate limiting
- Temporary data caching
- Real-time analytics

## Message Queue Architecture

### RabbitMQ

Used for service-to-service communication:
- Video processing events
- AI processing coordination
- System events

Queue Structure:
- video.uploaded
- video.processed
- ai.description
- ai.captions
- ai.tags

### Bull Queue

Manages task processing:
- Video processing jobs
- AI processing tasks
- Retry logic
- Job prioritization
- Progress tracking

## Scalability Design

### Horizontal Scaling

All components are designed for horizontal scaling:
- Stateless API servers
- Multiple video processors
- Distributed AI workers
- Load-balanced ingress

### Load Balancing

Nginx configuration for:
- Request distribution
- SSL termination
- Static file serving
- Health checks

### Caching Strategy

Multi-level caching:
- Redis for hot data
- CDN for video delivery
- In-memory caching where appropriate

## Monitoring and Reliability

### Health Checks

Each service implements:
- Liveness probes
- Readiness probes
- Dependency checks

### Metrics Collection

Key metrics tracked:
- Request latency
- Error rates
- Queue lengths
- Processing times
- Resource utilization

### Error Handling

Comprehensive error management:
- Graceful degradation
- Retry mechanisms
- Circuit breakers
- Error reporting

## Security Considerations

### Authentication

- JWT-based authentication
- Token refresh mechanism
- Role-based access control

### Data Protection

- Encryption at rest
- Secure file storage
- Access logging
- Audit trails

### API Security

- Rate limiting
- Input validation
- CORS policies
- Security headers

## Development Workflow

### Local Development

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Run migrations
npm run migrate

# Start API service
npm run dev
```

### Testing

Comprehensive test suite:
- Unit tests
- Integration tests
- E2E tests
- Load tests

### Deployment

Production deployment process:
1. Build Docker images
2. Run migrations
3. Deploy services
4. Health checks
5. Traffic cutover

## Future Considerations

Planned improvements:
1. Enhanced AI processing pipeline
2. Real-time video streaming
3. Advanced content clustering
4. Analytics dashboard
5. Content moderation system
