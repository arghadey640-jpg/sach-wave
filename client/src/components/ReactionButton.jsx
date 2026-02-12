import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { ThumbsUp, Laugh, Sparkles, Heart } from 'lucide-react'

const REACTIONS = {
  like: { icon: ThumbsUp, label: 'Like', color: 'text-blue-500', bg: 'bg-blue-50' },
  funny: { icon: Laugh, label: 'Funny', color: 'text-yellow-500', bg: 'bg-yellow-50' },
  wow: { icon: Sparkles, label: 'Wow', color: 'text-purple-500', bg: 'bg-purple-50' },
  support: { icon: Heart, label: 'Support', color: 'text-red-500', bg: 'bg-red-50' }
}

const ReactionButton = ({ postId, onReactionChange }) => {
  const [userReaction, setUserReaction] = useState(null)
  const [counts, setCounts] = useState({ like: 0, funny: 0, wow: 0, support: 0, total: 0, dominant: null })
  const [showPicker, setShowPicker] = useState(false)
  const [isLongPress, setIsLongPress] = useState(false)
  const longPressTimer = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    fetchReactions()
  }, [postId])

  const fetchReactions = async () => {
    try {
      const response = await axios.get(`/api/reactions/${postId}`)
      setCounts(response.data.counts)
      setUserReaction(response.data.userReaction)
    } catch (error) {
      console.error('Error fetching reactions:', error)
    }
  }

  const handleReaction = async (type) => {
    try {
      if (userReaction === type) {
        // Remove reaction
        await axios.delete(`/api/reactions/${postId}`)
        setUserReaction(null)
      } else {
        // Add/update reaction
        await axios.post(`/api/reactions/${postId}`, { type })
        setUserReaction(type)
      }
      await fetchReactions()
      onReactionChange?.()
    } catch (error) {
      console.error('Reaction error:', error)
    }
    setShowPicker(false)
  }

  const handleMouseDown = () => {
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true)
      setShowPicker(true)
    }, 500)
  }

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
    if (!isLongPress && !showPicker) {
      // Quick tap - toggle like
      handleReaction(userReaction || 'like')
    }
    setIsLongPress(false)
  }

  const handleMouseLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
    setIsLongPress(false)
  }

  const DominantIcon = counts.dominant ? REACTIONS[counts.dominant].icon : ThumbsUp
  const dominantColor = counts.dominant ? REACTIONS[counts.dominant].color : 'text-gray-500'

  return (
    <div className="relative" ref={buttonRef}>
      {/* Reaction Picker Popup */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-xl p-2 flex gap-1 z-50"
          >
            {Object.entries(REACTIONS).map(([type, config]) => {
              const Icon = config.icon
              return (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.3, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleReaction(type)}
                  className={`
                    p-2 rounded-full transition-colors
                    ${userReaction === type ? config.bg : 'hover:bg-gray-100'}
                  `}
                  title={config.label}
                >
                  <Icon className={`w-6 h-6 ${config.color}`} />
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        whileTap={{ scale: 0.9 }}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full transition-all
          ${userReaction 
            ? REACTIONS[userReaction].bg 
            : 'hover:bg-gray-100'
          }
        `}
      >
        <motion.div
          key={userReaction || 'none'}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <DominantIcon 
            className={`w-5 h-5 ${userReaction ? REACTIONS[userReaction].color : dominantColor}`} 
          />
        </motion.div>
        
        <span className={`text-sm font-medium ${userReaction ? REACTIONS[userReaction].color : 'text-gray-600'}`}>
          {userReaction ? REACTIONS[userReaction].label : (counts.total > 0 ? counts.total : 'Like')}
        </span>
      </motion.button>

      {/* Reaction Counts Display */}
      {counts.total > 0 && (
        <div className="flex items-center gap-1 mt-1">
          {Object.entries(REACTIONS).map(([type, config]) => {
            if (counts[type] === 0) return null
            const Icon = config.icon
            return (
              <motion.div
                key={type}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-0.5 text-xs"
              >
                <Icon className={`w-3 h-3 ${config.color}`} />
                <span className="text-gray-500">{counts[type]}</span>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ReactionButton
