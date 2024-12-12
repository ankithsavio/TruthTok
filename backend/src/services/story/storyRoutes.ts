import express from 'express'
import { storyController } from './storyController'
import { auth } from '../../middleware/auth'
import { validateLocation } from '../video/videoRoutes'

const router = express.Router()

// Create a new story
router.post('/', auth, async (req, res) => {
  try {
    const { videoId, location } = req.body
    const userId = req.user.id

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' })
    }

    if (!location || !validateLocation(location)) {
      return res.status(400).json({ error: 'Invalid location format' })
    }

    const story = await storyController.createStory({ userId, videoId, location })
    res.status(201).json(story)
  } catch (error) {
    console.error('Error creating story:', error)
    res.status(500).json({ error: 'Error creating story' })
  }
})

// Get a story by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const story = await storyController.getStory(req.params.id)
    if (!story) {
      return res.status(404).json({ error: 'Story not found' })
    }
    res.json(story)
  } catch (error) {
    console.error('Error fetching story:', error)
    res.status(500).json({ error: 'Error fetching story' })
  }
})

// List stories
router.get('/', auth, async (req, res) => {
  try {
    const stories = await storyController.listStories()
    res.json(stories)
  } catch (error) {
    console.error('Error listing stories:', error)
    res.status(500).json({ error: 'Error listing stories' })
  }
})

// Delete a story
router.delete('/:id', auth, async (req, res) => {
  try {
    await storyController.deleteStory(req.params.id)
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting story:', error)
    res.status(500).json({ error: 'Error deleting story' })
  }
})

export default router
