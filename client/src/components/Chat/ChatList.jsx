import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Clock } from 'lucide-react'

const ChatList = ({ onSelectChat, selectedUserId }) => {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await axios.get('/api/messages/conversations')
      setConversations(response.data.conversations)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    return `${Math.floor(diff / 86400000)}d`
  }

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">No messages yet</h3>
        <p className="text-gray-500 text-sm mt-1">Start a conversation with someone!</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {conversations.map((chat, index) => (
        <motion.div
          key={chat.userId}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSelectChat?.(chat)}
          className={`
            flex items-center gap-3 p-4 cursor-pointer transition-colors
            ${selectedUserId === chat.userId ? 'bg-purple-50' : 'hover:bg-gray-50'}
          `}
        >
          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5">
              <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                {chat.profileImage ? (
                  <img src={chat.profileImage} alt={chat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 font-semibold">{chat.name?.[0]}</span>
                  </div>
                )}
              </div>
            </div>
            {/* Online indicator */}
            {chat.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>

          {/* Chat Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-800 truncate">{chat.name}</h4>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(chat.lastMessageTime)}
              </span>
            </div>
            <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
              {chat.lastMessage}
            </p>
          </div>

          {/* Unread Badge */}
          {chat.unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center"
            >
              <span className="text-xs text-white font-bold">{chat.unreadCount}</span>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

export default ChatList
