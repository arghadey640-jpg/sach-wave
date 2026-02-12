import { motion } from 'framer-motion'
import { Check, CheckCheck } from 'lucide-react'

const MessageBubble = ({ message, isOwn }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender Name (for group chats) */}
        {!isOwn && message.senderName && (
          <p className="text-xs text-gray-500 mb-1 ml-1">{message.senderName}</p>
        )}
        
        {/* Message Bubble */}
        <div
          className={`
            px-4 py-2.5 rounded-2xl relative
            ${isOwn 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-md' 
              : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
            }
          `}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
          
          {/* Time and Read Status */}
          <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-[10px] ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
              {formatTime(message.timestamp)}
            </span>
            
            {isOwn && (
              <span className="text-white/70">
                {message.read ? (
                  <CheckCheck className="w-3 h-3" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default MessageBubble
