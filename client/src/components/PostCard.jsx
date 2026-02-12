import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Share2, MoreHorizontal, Trash2, Send, Heart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ReactionButton from './ReactionButton'
import axios from 'axios'

const PostCard = ({ post, index, onLike, onDelete, currentUserId }) => {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState(post.comments || [])
  const [newComment, setNewComment] = useState('')
  const [showLikeAnimation, setShowLikeAnimation] = useState(false)
  const { profile } = useAuth()

  const handleDoubleTap = () => {
    setShowLikeAnimation(true)
    setTimeout(() => setShowLikeAnimation(false), 300)
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const response = await axios.post(`/api/posts/${post.id}/comments`, {
        content: newComment
      })
      setComments([...comments, response.data.comment])
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white mb-4 shadow-sm"
    >
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5">
            <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
              <img 
                src={post.userImage || '/default-avatar.png'} 
                alt={post.userName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">{post.userName}</h3>
            <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
        </div>
        
        {post.userId === currentUserId && (
          <button 
            onClick={onDelete}
            className="p-2 hover:bg-red-50 rounded-full transition-colors text-gray-400 hover:text-red-500"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Post Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-gray-800">{post.content}</p>
        </div>
      )}

      {/* Post Image */}
      {post.image && (
        <div className="relative">
          <img 
            src={post.image} 
            alt="Post content" 
            className="w-full max-h-[500px] object-cover"
            onDoubleClick={handleDoubleTap}
          />
          <AnimatePresence>
            {showLikeAnimation && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart className="w-24 h-24 text-white fill-red-500 drop-shadow-lg" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <ReactionButton 
            postId={post.id} 
            onReactionChange={onLike}
          />
          
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 group p-2"
          >
            <MessageCircle className="w-6 h-6 text-gray-700 group-hover:text-blue-500 transition-colors" />
            <span className="text-sm text-gray-700">
              {comments.length > 0 && comments.length}
            </span>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.8 }}
            className="group p-2"
          >
            <Share2 className="w-6 h-6 text-gray-700 group-hover:text-green-500 transition-colors" />
          </motion.button>
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 overflow-hidden"
          >
            <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-gray-400 text-sm text-center">No comments yet</p>
              ) : (
                comments.map((comment, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-2"
                  >
                    <span className="font-semibold text-sm text-gray-800">{comment.userName}</span>
                    <span className="text-sm text-gray-600">{comment.content}</span>
                  </motion.div>
                ))
              )}
            </div>
            
            {/* Add Comment */}
            <form onSubmit={handleAddComment} className="p-4 border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
              />
              <motion.button
                type="submit"
                whileTap={{ scale: 0.9 }}
                disabled={!newComment.trim()}
                className="p-2 text-purple-600 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

export default PostCard
