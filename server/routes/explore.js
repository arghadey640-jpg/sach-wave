import express from 'express'
import { getPosts, savePosts, getProfiles, getFollowers, getReactions } from '../utils/dataStore.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Get trending posts
router.get('/trending', authenticate, (req, res) => {
  try {
    const posts = getPosts()
    const profiles = getProfiles()
    const reactions = getReactions()

    // Calculate trending score based on reactions, comments, and recency
    const now = new Date()
    const trendingPosts = posts
      .map(post => {
        const profile = profiles.find(p => p.userId === post.userId)
        const postReactions = reactions.filter(r => r.postId === post.id)
        const reactionCount = postReactions.length
        const hoursSincePosted = (now - new Date(post.createdAt)) / (1000 * 60 * 60)
        
        // Trending score: more reactions = higher, older = lower
        const trendingScore = reactionCount / Math.max(hoursSincePosted, 1)

        return {
          ...post,
          userName: profile?.name || 'Unknown',
          userImage: profile?.profileImage,
          reactionCount,
          trendingScore
        }
      })
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 20)

    res.json({ posts: trendingPosts })
  } catch (error) {
    console.error('Get trending error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get popular users
router.get('/popular-users', authenticate, (req, res) => {
  try {
    const followers = getFollowers()
    const profiles = getProfiles()
    const posts = getPosts()

    const userStats = {}

    // Count followers for each user
    followers.forEach(f => {
      if (!userStats[f.followingId]) {
        userStats[f.followingId] = { followers: 0, posts: 0 }
      }
      userStats[f.followingId].followers++
    })

    // Count posts for each user
    posts.forEach(p => {
      if (!userStats[p.userId]) {
        userStats[p.userId] = { followers: 0, posts: 0 }
      }
      userStats[p.userId].posts++
    })

    const popularUsers = Object.entries(userStats)
      .map(([userId, stats]) => {
        const profile = profiles.find(p => p.userId === userId)
        return {
          userId,
          name: profile?.name || 'Unknown',
          profileImage: profile?.profileImage,
          stream: profile?.stream,
          followersCount: stats.followers,
          postsCount: stats.posts,
          popularityScore: stats.followers * 2 + stats.posts
        }
      })
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, 10)

    res.json({ users: popularUsers })
  } catch (error) {
    console.error('Get popular users error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Search by hashtag
router.get('/hashtags/:tag', authenticate, (req, res) => {
  try {
    const { tag } = req.params
    const posts = getPosts()
    const profiles = getProfiles()

    const hashtagPattern = new RegExp(`#${tag}\\b`, 'i')

    const taggedPosts = posts
      .filter(post => hashtagPattern.test(post.content))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(post => {
        const profile = profiles.find(p => p.userId === post.userId)
        return {
          ...post,
          userName: profile?.name || 'Unknown',
          userImage: profile?.profileImage
        }
      })

    res.json({ posts: taggedPosts, tag })
  } catch (error) {
    console.error('Search hashtag error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get trending hashtags
router.get('/trending-hashtags', authenticate, (req, res) => {
  try {
    const posts = getPosts()
    const hashtagCounts = {}

    posts.forEach(post => {
      if (post.content) {
        const hashtags = post.content.match(/#\w+/g) || []
        hashtags.forEach(tag => {
          const lowerTag = tag.toLowerCase()
          hashtagCounts[lowerTag] = (hashtagCounts[lowerTag] || 0) + 1
        })
      }
    })

    const trendingHashtags = Object.entries(hashtagCounts)
      .map(([tag, count]) => ({ tag: tag.substring(1), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    res.json({ hashtags: trendingHashtags })
  } catch (error) {
    console.error('Get trending hashtags error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get recommended users (not following)
router.get('/recommended', authenticate, (req, res) => {
  try {
    const followers = getFollowers()
    const profiles = getProfiles()
    const currentUserId = req.user.id

    // Get list of users current user is following
    const followingIds = followers
      .filter(f => f.followerId === currentUserId)
      .map(f => f.followingId)

    // Get recommended users (not following, not self)
    const recommended = profiles
      .filter(p => p.userId !== currentUserId && !followingIds.includes(p.userId))
      .slice(0, 5)
      .map(p => ({
        userId: p.userId,
        name: p.name,
        profileImage: p.profileImage,
        stream: p.stream,
        bio: p.bio
      }))

    res.json({ users: recommended })
  } catch (error) {
    console.error('Get recommended error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
