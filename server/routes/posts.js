import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getPosts, savePosts, getProfiles, getComments, saveComments, getLikes, saveLikes } from '../utils/dataStore.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Get all posts
router.get('/', authenticate, (req, res) => {
  try {
    const posts = getPosts()
    const profiles = getProfiles()
    const likes = getLikes()
    const comments = getComments()

    // Enrich posts with user info
    const enrichedPosts = posts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(post => {
        const profile = profiles.find(p => p.userId === post.userId)
        const postLikes = likes.filter(l => l.postId === post.id).map(l => l.userId)
        const postComments = comments.filter(c => c.postId === post.id)

        return {
          ...post,
          userName: profile?.name || 'Unknown',
          userImage: profile?.profileImage,
          likes: postLikes,
          comments: postComments
        }
      })

    res.json({ posts: enrichedPosts })
  } catch (error) {
    console.error('Get posts error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get posts by user
router.get('/user/:userId', authenticate, (req, res) => {
  try {
    const posts = getPosts()
    const profiles = getProfiles()

    const userPosts = posts
      .filter(p => p.userId === req.params.userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(post => {
        const profile = profiles.find(p => p.userId === post.userId)
        return {
          ...post,
          userName: profile?.name || 'Unknown',
          userImage: profile?.profileImage
        }
      })

    res.json({ posts: userPosts })
  } catch (error) {
    console.error('Get user posts error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create post
router.post('/', authenticate, (req, res) => {
  try {
    const { content, image } = req.body
    const userId = req.user.id

    if (!content && !image) {
      return res.status(400).json({ message: 'Post must have content or image' })
    }

    const posts = getPosts()
    
    const newPost = {
      id: uuidv4(),
      userId,
      content: content || '',
      image: image || null,
      createdAt: new Date().toISOString()
    }

    posts.push(newPost)
    savePosts(posts)

    // Get profile info for response
    const profiles = getProfiles()
    const profile = profiles.find(p => p.userId === userId)

    res.status(201).json({
      message: 'Post created successfully',
      post: {
        ...newPost,
        userName: profile?.name || 'Unknown',
        userImage: profile?.profileImage,
        likes: [],
        comments: []
      }
    })
  } catch (error) {
    console.error('Create post error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete post
router.delete('/:postId', authenticate, (req, res) => {
  try {
    const posts = getPosts()
    const post = posts.find(p => p.id === req.params.postId)

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    if (post.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const updatedPosts = posts.filter(p => p.id !== req.params.postId)
    savePosts(updatedPosts)

    // Clean up likes and comments
    const likes = getLikes().filter(l => l.postId !== req.params.postId)
    const comments = getComments().filter(c => c.postId !== req.params.postId)
    saveLikes(likes)
    saveComments(comments)

    res.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Delete post error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Like/unlike post
router.post('/:postId/like', authenticate, (req, res) => {
  try {
    const likes = getLikes()
    const existingLike = likes.find(l => l.postId === req.params.postId && l.userId === req.user.id)

    if (existingLike) {
      // Unlike
      const updatedLikes = likes.filter(l => !(l.postId === req.params.postId && l.userId === req.user.id))
      saveLikes(updatedLikes)
      res.json({ message: 'Post unliked', liked: false })
    } else {
      // Like
      likes.push({
        id: uuidv4(),
        postId: req.params.postId,
        userId: req.user.id,
        createdAt: new Date().toISOString()
      })
      saveLikes(likes)
      res.json({ message: 'Post liked', liked: true })
    }
  } catch (error) {
    console.error('Like post error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get comments
router.get('/:postId/comments', authenticate, (req, res) => {
  try {
    const comments = getComments()
    const profiles = getProfiles()

    const postComments = comments
      .filter(c => c.postId === req.params.postId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(comment => {
        const profile = profiles.find(p => p.userId === comment.userId)
        return {
          ...comment,
          userName: profile?.name || 'Unknown'
        }
      })

    res.json({ comments: postComments })
  } catch (error) {
    console.error('Get comments error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Add comment
router.post('/:postId/comments', authenticate, (req, res) => {
  try {
    const { content } = req.body

    if (!content?.trim()) {
      return res.status(400).json({ message: 'Comment content is required' })
    }

    const comments = getComments()
    const profiles = getProfiles()

    const newComment = {
      id: uuidv4(),
      postId: req.params.postId,
      userId: req.user.id,
      content: content.trim(),
      createdAt: new Date().toISOString()
    }

    comments.push(newComment)
    saveComments(comments)

    const profile = profiles.find(p => p.userId === req.user.id)

    res.status(201).json({
      message: 'Comment added',
      comment: {
        ...newComment,
        userName: profile?.name || 'Unknown'
      }
    })
  } catch (error) {
    console.error('Add comment error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
