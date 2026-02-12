import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getStories, saveStories, getProfiles, getStoryViews, saveStoryViews } from '../utils/dataStore.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Get all active stories (less than 24 hours old)
router.get('/', authenticate, (req, res) => {
  try {
    const stories = getStories()
    const profiles = getProfiles()
    const now = new Date()
    const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000)

    const activeStories = stories
      .filter(s => new Date(s.createdAt) > twentyFourHoursAgo)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(story => {
        const profile = profiles.find(p => p.userId === story.userId)
        return {
          ...story,
          userName: profile?.name || 'Unknown',
          userImage: profile?.profileImage
        }
      })

    res.json({ stories: activeStories })
  } catch (error) {
    console.error('Get stories error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create story
router.post('/', authenticate, (req, res) => {
  try {
    const { image, content, type = 'image' } = req.body
    const userId = req.user.id

    if (!image && !content) {
      return res.status(400).json({ message: 'Story must have image or content' })
    }

    const stories = getStories()
    
    const newStory = {
      id: uuidv4(),
      userId,
      image: image || null,
      content: content || null,
      background: req.body.background || 0,
      type,
      createdAt: new Date().toISOString()
    }

    stories.push(newStory)
    saveStories(stories)

    const profiles = getProfiles()
    const profile = profiles.find(p => p.userId === userId)

    res.status(201).json({
      message: 'Story created successfully',
      story: {
        ...newStory,
        userName: profile?.name || 'Unknown',
        userImage: profile?.profileImage
      }
    })
  } catch (error) {
    console.error('Create story error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete story
router.delete('/:storyId', authenticate, (req, res) => {
  try {
    const stories = getStories()
    const story = stories.find(s => s.id === req.params.storyId)

    if (!story) {
      return res.status(404).json({ message: 'Story not found' })
    }

    if (story.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const updatedStories = stories.filter(s => s.id !== req.params.storyId)
    saveStories(updatedStories)

    res.json({ message: 'Story deleted successfully' })
  } catch (error) {
    console.error('Delete story error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Record story view
router.post('/:storyId/view', authenticate, (req, res) => {
  try {
    const storyId = req.params.storyId
    const userId = req.user.id
    
    const storyViews = getStoryViews()
    
    // Check if already viewed
    const existingView = storyViews.find(v => v.storyId === storyId && v.userId === userId)
    if (!existingView) {
      storyViews.push({
        id: uuidv4(),
        storyId,
        userId,
        viewedAt: new Date().toISOString()
      })
      saveStoryViews(storyViews)
    }
    
    res.json({ message: 'View recorded' })
  } catch (error) {
    console.error('Record view error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get story viewers
router.get('/:storyId/viewers', authenticate, (req, res) => {
  try {
    const storyId = req.params.storyId
    const stories = getStories()
    const story = stories.find(s => s.id === storyId)
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' })
    }
    
    // Only story owner can see viewers
    if (story.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' })
    }
    
    const storyViews = getStoryViews()
    const profiles = getProfiles()
    
    const viewers = storyViews
      .filter(v => v.storyId === storyId)
      .map(v => {
        const profile = profiles.find(p => p.userId === v.userId)
        return {
          id: v.id,
          userId: v.userId,
          userName: profile?.name || 'Unknown',
          userImage: profile?.profileImage,
          viewedAt: v.viewedAt
        }
      })
    
    res.json({ viewers })
  } catch (error) {
    console.error('Get viewers error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
