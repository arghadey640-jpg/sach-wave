import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Trophy, Star, Target } from 'lucide-react'

const LEVELS = {
  Newbie: { icon: '🌱', color: 'bg-green-100 text-green-700', min: 0 },
  Active: { icon: '🌿', color: 'bg-blue-100 text-blue-700', min: 100 },
  Popular: { icon: '🌳', color: 'bg-purple-100 text-purple-700', min: 500 },
  'Star Student': { icon: '⭐', color: 'bg-yellow-100 text-yellow-700', min: 1000 }
}

const PointsBadge = ({ userId, showDetails = false }) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [userId])

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/gamification/points')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching points:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full" />
        <div className="w-20 h-4 bg-gray-200 rounded" />
      </div>
    )
  }

  if (!stats) return null

  const levelConfig = LEVELS[stats.level] || LEVELS.Newbie

  return (
    <div className={`inline-flex items-center gap-2 ${showDetails ? 'flex-col items-start' : ''}`}>
      {/* Points Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-2"
      >
        <div className={`px-3 py-1 rounded-full ${levelConfig.color} flex items-center gap-1`}>
          <Trophy className="w-4 h-4" />
          <span className="font-bold text-sm">{stats.points} pts</span>
        </div>
        
        <div className="flex items-center gap-1 text-lg">
          <span>{levelConfig.icon}</span>
          <span className="text-sm font-medium text-gray-600">{stats.level}</span>
        </div>
      </motion.div>

      {/* Detailed Stats */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 w-full"
        >
          {/* Progress Bar */}
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            />
          </div>
          
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>{stats.progress}% to {stats.nextLevel || 'Max'}</span>
            <span>{stats.pointsToNextLevel > 0 ? `${stats.pointsToNextLevel} pts needed` : 'Max level!'}</span>
          </div>

          {/* Badges */}
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Badges</h4>
            <div className="flex flex-wrap gap-2">
              {stats.badges.map((badge, index) => (
                <motion.span
                  key={badge}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 capitalize"
                >
                  {badge.replace('_', ' ')}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default PointsBadge
