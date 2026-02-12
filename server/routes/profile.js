import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getProfiles, saveProfiles, getUsers } from '../utils/dataStore.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Get profile by user ID
router.get('/:userId', (req, res) => {
  try {
    const profiles = getProfiles()
    const users = getUsers()
    const profile = profiles.find(p => p.userId === req.params.userId)

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' })
    }

    // Get user's role
    const user = users.find(u => u.id === req.params.userId)

    res.json({ 
      profile: {
        ...profile,
        role: user?.role || 'user'
      }
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create profile
router.post('/', authenticate, (req, res) => {
  try {
    const { name, dateOfBirth, rollNumber, stream, bio, profileImage, coverImage, accentColor } = req.body
    const userId = req.user.id

    if (!name || !dateOfBirth || !rollNumber || !stream) {
      return res.status(400).json({ message: 'Required fields are missing' })
    }

    const profiles = getProfiles()
    
    // Check if profile exists
    const existingIndex = profiles.findIndex(p => p.userId === userId)
    
    const profileData = {
      id: existingIndex >= 0 ? profiles[existingIndex].id : uuidv4(),
      userId,
      name,
      dateOfBirth,
      rollNumber,
      stream,
      bio: bio || '',
      profileImage: profileImage || null,
      coverImage: coverImage || null,
      accentColor: accentColor || 'purple',
      updatedAt: new Date().toISOString(),
      createdAt: existingIndex >= 0 ? profiles[existingIndex].createdAt : new Date().toISOString()
    }

    if (existingIndex >= 0) {
      profiles[existingIndex] = profileData
    } else {
      profiles.push(profileData)
    }

    saveProfiles(profiles)

    res.status(201).json({
      message: 'Profile created successfully',
      profile: profileData
    })
  } catch (error) {
    console.error('Create profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update profile
router.put('/:userId', authenticate, (req, res) => {
  try {
    if (req.params.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const profiles = getProfiles()
    const index = profiles.findIndex(p => p.userId === req.params.userId)

    if (index === -1) {
      return res.status(404).json({ message: 'Profile not found' })
    }

    profiles[index] = {
      ...profiles[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    }

    saveProfiles(profiles)

    res.json({
      message: 'Profile updated successfully',
      profile: profiles[index]
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Search profiles
router.get('/search', authenticate, (req, res) => {
  try {
    const { q } = req.query
    const profiles = getProfiles()
    const users = getUsers()

    if (!q) {
      return res.json({ profiles: [] })
    }

    const searchTerm = q.toLowerCase()
    const results = profiles.filter(p => 
      p.name?.toLowerCase().includes(searchTerm) ||
      p.stream?.toLowerCase().includes(searchTerm) ||
      p.rollNumber?.toLowerCase().includes(searchTerm)
    ).map(p => ({
      ...p,
      email: users.find(u => u.id === p.userId)?.email
    }))

    res.json({ profiles: results })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
