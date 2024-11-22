import Redis from 'ioredis'

export class CacheService {
  constructor(private redis: Redis) {}

  async cacheVideoMetadata(videoId: string, metadata: any) {
    await this.redis.setex(`video:${videoId}`, 3600, JSON.stringify(metadata))
  }

  async getCachedStories(lat: number, lng: number, radius: number) {
    const key = `stories:${lat}:${lng}:${radius}`
    const cached = await this.redis.get(key)
    if (cached) return JSON.parse(cached)
    return null
  }

  // Implement geospatial indexing
  async indexVideoLocation(videoId: string, lat: number, lng: number) {
    await this.redis.geoadd('video-locations', lng, lat, videoId)
  }
} 