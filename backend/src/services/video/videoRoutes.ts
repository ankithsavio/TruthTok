import express from 'express'
import multer from 'multer'
import { PrismaClient } from '@prisma/client'
import { videoUploadService } from './videoUpload'
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth'
import { rateLimit } from 'express-rate-limit'

const router = express.Router()
const prisma = new PrismaClient()
const upload = multer({ storage: multer.memoryStorage() })

// Rate limiting for video uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 uploads per windowMs
  message: 'Too many uploads from this IP, please try again later'
})

// Upload video
router.post(
  '/upload',
  authMiddleware,
  uploadLimiter,
  upload.single('video'),
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No video file provided' })
      }

      let location
      if (req.body.location) {
        try {
          location = JSON.parse(req.body.location)
          if (!validateLocation(location)) {
            return res.status(400).json({ error: 'Invalid location format' })
          }
        } catch (error) {
          return res.status(400).json({ error: 'Invalid location data' })
        }
      }

      const video = await videoUploadService.uploadVideo(
        req.file,
        req.user.id,
        location,
        req.body.description
      )

      res.status(201).json(video)
    } catch (error) {
      console.error('Error in video upload:', error)
      res.status(500).json({ error: 'Error uploading video' })
    }
  }
)

// Get video by ID
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const video = await prisma.video.findUnique({
      where: { id: req.params.id },
      include: {
        metadata: true,
        captions: true,
        tags: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }

    res.json(video)
  } catch (error) {
    console.error('Error fetching video:', error)
    res.status(500).json({ error: 'Error fetching video' })
  }
})

// Get videos by location
router.get('/location/:lat/:lng/:radiusKm', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { lat, lng, radiusKm } = req.params
    const latitude = parseFloat(lat)
    const longitude = parseFloat(lng)
    const radius = parseFloat(radiusKm)

    // This is a simple implementation. For production, use PostGIS or similar
    const videos = await prisma.video.findMany({
      where: {
        location: {
          path: ['lat'],
          gte: latitude - radius / 111, // rough conversion from km to degrees
          lte: latitude + radius / 111,
        },
        AND: {
          location: {
            path: ['lng'],
            gte: longitude - radius / (111 * Math.cos(latitude * Math.PI / 180)),
            lte: longitude + radius / (111 * Math.cos(latitude * Math.PI / 180)),
          },
        },
      },
      include: {
        metadata: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 50,
    })

    res.json(videos)
  } catch (error) {
    console.error('Error fetching videos by location:', error)
    res.status(500).json({ error: 'Error fetching videos' })
  }
})

// Get processing status
router.get('/:id/status', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const video = await prisma.video.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        status: true,
        metadata: {
          select: {
            processingLogs: true,
          },
        },
      },
    })

    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }

    res.json(video)
  } catch (error) {
    console.error('Error fetching video status:', error)
    res.status(500).json({ error: 'Error fetching video status' })
  }
})

const validateLocation = (location: any): boolean => {
  if (!location || typeof location !== 'object') return false
  if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') return false
  if (location.latitude < -90 || location.latitude > 90) return false
  if (location.longitude < -180 || location.longitude > 180) return false
  return true
}

export default router
