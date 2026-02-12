import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { Heart, MessageCircle, UserPlus, Bell, CheckCheck, Trash2, Sparkles, ThumbsUp, Laugh } from 'lucide-react'
import axios from 'axios'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotifications()
    // Mark all as read when viewing
    markAllAsRead()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications')
      setNotifications(response.data.notifications || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all')
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  const handleDeleteNotification = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />
      case 'reaction':
        return <Sparkles className="w-5 h-5 text-purple-500" />
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />
      case 'mention':
        return <Bell className="w-5 h-5 text-orange-500" />
      default:
        return <Bell className="w-5 h-5 text-purple-500" />
    }
  }

  const getMessage = (notification) => {
    switch (notification.type) {
      case 'like':
        return `liked your post`
      case 'reaction':
        return `reacted ${notification.reactionType || ''} to your post`
      case 'comment':
        return `commented: "${notification.comment?.substring(0, 30)}${notification.comment?.length > 30 ? '...' : ''}"`
      case 'follow':
        return `started following you`
      case 'mention':
        return `mentioned you in a post`
      default:
        return notification.message
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'likes') return n.type === 'like' || n.type === 'reaction'
    if (filter === 'comments') return n.type === 'comment' || n.type === 'mention'
    if (filter === 'follows') return n.type === 'follow'
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3"
      >
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {notifications.length > 0 && (
            <button 
              onClick={() => {
                setNotifications([])
                axios.delete('/api/notifications/clear-all').catch(console.error)
              }}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </motion.header>

      {/* Filter Tabs */}
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: 'all', label: 'All', count: notifications.length },
            { id: 'likes', label: 'Likes', count: notifications.filter(n => n.type === 'like' || n.type === 'reaction').length },
            { id: 'comments', label: 'Comments', count: notifications.filter(n => n.type === 'comment' || n.type === 'mention').length },
            { id: 'follows', label: 'Follows', count: notifications.filter(n => n.type === 'follow').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1.5 text-xs ${filter === tab.id ? 'text-purple-200' : 'text-gray-400'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <main className="max-w-lg mx-auto">
        {loading ? (
          <div className="space-y-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3 p-4 bg-white animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 px-4"
          >
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
            </h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? "When someone interacts with your posts, you'll see it here"
                : `When you get ${filter}, they'll appear here`
              }
            </p>
          </motion.div>
        ) : (
          <div className="divide-y divide-gray-100">
            <AnimatePresence>
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group flex items-center gap-3 p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-purple-50/50' : ''
                  }`}
                  onClick={() => {
                    if (notification.postId) navigate(`/home`)
                    if (notification.userId) navigate(`/profile/${notification.userId}`)
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {notification.userImage ? (
                      <img 
                        src={notification.userImage} 
                        alt={notification.userName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getIcon(notification.type)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800">
                      <span className="font-semibold">{notification.userName}</span>{' '}
                      <span className="text-gray-600">{getMessage(notification)}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <div className="w-2 h-2 bg-purple-600 rounded-full" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteNotification(notification.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

export default Notifications
