import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { UserPlus, UserCheck, Loader2 } from 'lucide-react'

const FollowButton = ({ userId, onFollowChange, showFollowsYou = true }) => {
  const [isFollowing, setIsFollowing] = useState(false)
  const [followsYou, setFollowsYou] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    checkFollowStatus()
  }, [userId])

  const checkFollowStatus = async () => {
    try {
      const response = await axios.get(`/api/followers/status/${userId}`)
      setIsFollowing(response.data.isFollowing)
      setFollowsYou(response.data.followsYou)
    } catch (error) {
      console.error('Error checking follow status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    setLoading(true)
    try {
      if (isFollowing) {
        await axios.post(`/api/followers/unfollow/${userId}`)
        setIsFollowing(false)
      } else {
        await axios.post(`/api/followers/follow/${userId}`)
        setIsFollowing(true)
      }
      onFollowChange?.()
    } catch (error) {
      console.error('Follow error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <button className="px-6 py-2 bg-gray-200 rounded-full">
        <Loader2 className="w-5 h-5 animate-spin" />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {showFollowsYou && followsYou && (
        <span className="text-xs text-gray-500">Follows you</span>
      )}
      <motion.button
        onClick={handleFollow}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        whileTap={{ scale: 0.95 }}
        className={`
          relative px-6 py-2 rounded-full font-medium transition-all duration-300
          overflow-hidden
          ${isFollowing 
            ? 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300' 
            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl'
          }
        `}
      >
        <AnimatePresence mode="wait">
          {isFollowing ? (
            <motion.span
              key="following"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              {isHovering ? 'Unfollow' : 'Following'}
            </motion.span>
          ) : (
            <motion.span
              key="follow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Follow
            </motion.span>
          )}
        </AnimatePresence>
        
        {/* Ripple effect */}
        <motion.span
          className="absolute inset-0 bg-white/20 rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      </motion.button>
    </div>
  )
}

export default FollowButton
