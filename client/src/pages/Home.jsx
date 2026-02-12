import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'
import Stories from '../components/Stories'
import PostCard from '../components/PostCard'
import { PostSkeleton, StorySkeleton } from '../components/SkeletonLoader'
import axios from 'axios'
import { RefreshCw, Users, PlusCircle } from 'lucide-react'

const Home = () => {
  const [posts, setPosts] = useState([])
  const [stories, setStories] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const [postsRes, storiesRes, suggestionsRes] = await Promise.all([
        axios.get('/api/posts'),
        axios.get('/api/stories'),
        axios.get('/api/explore/suggestions')
      ])
      
      // Sort posts by createdAt descending (newest first)
      const sortedPosts = (postsRes.data.posts || []).sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      )
      
      // Sort stories by createdAt descending
      const sortedStories = (storiesRes.data.stories || []).sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      )
      
      setPosts(sortedPosts)
      setStories(sortedStories)
      setSuggestions(suggestionsRes.data.suggestions?.slice(0, 5) || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle navigation state (refresh after creating post)
  useEffect(() => {
    if (location.state?.refreshFeed) {
      fetchData(false)
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, location.pathname, navigate, fetchData])

  // Auto-refresh every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(false)
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData(false)
  }

  const handleCreatePost = () => {
    navigate('/create', {
      state: {
        onPostCreated: (newPost) => {
          // Optimistically add the new post to the feed
          setPosts(prev => [newPost, ...prev])
        }
      }
    })
  }

  const handleLike = async (postId) => {
    try {
      await axios.post(`/api/posts/${postId}/like`)
      setPosts(posts.map(post => {
        if (post.id === postId) {
          const isLiked = post.likes?.includes(user.id)
          return {
            ...post,
            likes: isLiked 
              ? post.likes.filter(id => id !== user.id)
              : [...(post.likes || []), user.id]
          }
        }
        return post
      }))
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`/api/posts/${postId}`)
      setPosts(posts.filter(post => post.id !== postId))
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 py-3"
      >
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Sach Wave" className="w-8 h-8 object-contain" />
            <h1 className="text-xl font-bold gradient-text">Sach Wave</h1>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ rotate: 180 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleCreatePost}
              className="p-2 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
            >
              <PlusCircle className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Stories */}
      {loading ? <StorySkeleton /> : <Stories stories={stories} loading={loading} onStoryCreated={fetchData} />}

      {/* Suggestions - Only show when user has few posts */}
      {!loading && suggestions.length > 0 && posts.length < 5 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-b border-gray-200 py-4"
        >
          <div className="max-w-lg mx-auto px-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-semibold text-gray-700">People to follow</h3>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {suggestions.map((user) => (
                <motion.div
                  key={user.id}
                  whileHover={{ scale: 1.02 }}
                  className="flex-shrink-0 flex flex-col items-center p-3 bg-gray-50 rounded-xl min-w-[100px]"
                >
                  <img
                    src={user.profileImage || '/default-avatar.png'}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover mb-2"
                  />
                  <p className="text-xs font-medium text-gray-800 truncate w-full text-center">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate w-full text-center">{user.stream}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Feed */}
      <main className="max-w-lg mx-auto">
        {loading ? (
          <div className="space-y-4">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 px-4"
          >
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🌊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts yet</h3>
            <p className="text-gray-500">Be the first to share something!</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {posts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                index={index}
                onLike={() => handleLike(post.id)}
                onDelete={() => handleDeletePost(post.id)}
                currentUserId={user?.id}
              />
            ))}
          </AnimatePresence>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

export default Home
