import express from 'express'
import cors from 'cors'
import videoRoutes from './services/video/videoRoutes'
import storyRoutes from './services/story/storyRoutes'
import { healthRoutes } from './services/health/healthRoutes'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/videos', videoRoutes)
app.use('/api/stories', storyRoutes)
app.use('/health', healthRoutes)

export default app
