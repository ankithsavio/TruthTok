# TruthTok Backend System

A production-grade, horizontally scalable backend system for short-form video storage and AI-powered content analysis.

## System Overview

TruthTok's backend is designed as a robust, scalable microservices architecture for handling short-form video content with advanced AI-powered metadata generation. The system is built to handle high throughput, ensure data reliability, and provide seamless scaling capabilities.

### Key Features

- Short-form video storage and streaming
- AI-powered video description generation
- Real-time video caption generation
- Automatic video metadata extraction
- Geospatial video clustering
- Horizontal scalability
- Container-based deployment
- Production-grade monitoring and reliability

## Architecture

The system is composed of several key components:

### Core Services

1. **API Service**
   - Handles all client requests
   - Manages authentication and authorization
   - Routes video upload and retrieval requests
   - Scales horizontally for high availability

2. **Video Processing Service**
   - Processes uploaded videos
   - Extracts metadata (duration, resolution, etc.)
   - Generates thumbnails
   - Optimizes video formats
   - Scales independently based on processing load

3. **AI Processing Pipeline**
   - Generates video descriptions using OpenAI
   - Creates automatic captions
   - Extracts relevant tags
   - Asynchronous processing via message queues

### Infrastructure Components

1. **Storage**
   - MinIO for video file storage
   - PostgreSQL for metadata and relationships
   - Redis for caching and rate limiting

2. **Message Queue**
   - RabbitMQ for async task processing
   - Bull for job queues and scheduling

3. **Load Balancing**
   - Nginx for request distribution
   - Health checks and automatic failover

## Technical Requirements

### Storage Requirements
- Support for various video formats
- Efficient video streaming capabilities
- Secure file storage with access control
- Metadata storage and indexing

### Scalability Requirements
- Horizontal scaling of all services
- Load balancing across instances
- Distributed processing capabilities
- Auto-scaling based on load

### Performance Requirements
- Low latency video delivery
- Fast upload processing
- Efficient search and retrieval
- Real-time analytics capabilities

### Security Requirements
- Secure file storage
- Authentication and authorization
- Rate limiting
- Data encryption

## Setup and Deployment

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for development)
- PostgreSQL 15+
- Redis 7+
- MinIO
- RabbitMQ

### Environment Variables
Required environment variables are documented in `.env.example`. Key variables include:
- Database configurations
- Storage credentials
- API keys for external services
- Security configurations

### Development Setup
```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Start development environment
docker-compose -f docker-compose.dev.yml up
```

### Production Deployment
```bash
# Build and start services
docker-compose up -d

# Scale services as needed
docker-compose up -d --scale backend=3 --scale video-processor=5
```

## System Monitoring

The system includes comprehensive monitoring:
- Service health checks
- Performance metrics
- Error tracking
- Resource utilization
- Queue monitoring

## Contributing

Please refer to our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
