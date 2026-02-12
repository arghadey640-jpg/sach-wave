import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import ChatList from '../components/Chat/ChatList'
import MessageBubble from '../components/Chat/MessageBubble'
import TypingIndicator from '../components/Chat/TypingIndicator'
import BottomNav from '../components/BottomNav'
import { ArrowLeft, Send, Phone, Video, MoreVertical, Image, Smile } from 'lucide-react'

const Messages = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (userId) {
      fetchMessages(userId)
      fetchChatInfo(userId)
    }
  }, [userId])

  // Poll for new messages
  useEffect(() => {
    if (!userId) return
    const interval = setInterval(() => fetchMessages(userId, false), 3000)
    return () => clearInterval(interval)
  }, [userId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchChatInfo = async (id) => {
    try {
      const response = await axios.get(`/api/profile/${id}`)
      setSelectedChat(response.data.profile)
    } catch (error) {
      console.error('Error fetching chat info:', error)
    }
  }

  const fetchMessages = async (id, showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const response = await axios.get(`/api/messages/${id}`)
      setMessages(response.data.messages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !userId) return

    const tempMessage = {
      id: 'temp',
      content: newMessage,
      senderId: user.id,
      timestamp: new Date().toISOString(),
      read: false
    }

    setMessages([...messages, tempMessage])
    setNewMessage('')

    try {
      await axios.post(`/api/messages/${userId}`, { content: newMessage })
      fetchMessages(userId, false)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleChatSelect = (chat) => {
    navigate(`/messages/${chat.userId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <motion.header
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-40 bg-white border-b border-gray-200"
      >
        <div className="max-w-lg mx-auto">
          {userId ? (
            // Active Chat Header
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/messages')}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5">
                      <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                        {selectedChat?.profileImage ? (
                          <img 
                            src={selectedChat.profileImage} 
                            alt={selectedChat.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 font-semibold text-sm">
                              {selectedChat?.name?.[0]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  
                  <div>
                    <h2 className="font-semibold text-gray-800">{selectedChat?.name}</h2>
                    <p className="text-xs text-green-600">Online</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          ) : (
            // Messages List Header
            <div className="flex items-center justify-between px-4 py-3">
              <h1 className="text-xl font-bold text-gray-800">Messages</h1>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </motion.header>

      {/* Content */}
      <main className="max-w-lg mx-auto">
        {userId ? (
          // Active Chat View
          <div className="flex flex-col h-[calc(100vh-140px)]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Send className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-gray-500">Start a conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.senderId === user?.id}
                  />
                ))
              )}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button type="button" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Image className="w-5 h-5 text-gray-500" />
                </button>
                <button type="button" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Smile className="w-5 h-5 text-gray-500" />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                />
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.9 }}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </form>
          </div>
        ) : (
          // Chat List View
          <ChatList onSelectChat={handleChatSelect} />
        )}
      </main>

      <BottomNav />
    </div>
  )
}

export default Messages
