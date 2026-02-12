import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'
import { Image, X, Send, Loader2, CheckCircle } from 'lucide-react'
import axios from 'axios'

const CreatePost = () => {
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useAuth()
  const onPostCreated = location.state?.onPostCreated

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size should be less than 10MB')
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result)
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImage(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content.trim() && !image) {
      setError('Please add some content or an image')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/posts', {
        content: content.trim(),
        image: image
      })
      
      setSuccess(true)
      
      // Call the callback if provided (for refreshing home feed)
      if (onPostCreated) {
        onPostCreated(response.data.post)
      }
      
      // Short delay to show success message before navigating
      setTimeout(() => {
        navigate('/home', { 
          replace: true,
          state: { 
            refreshFeed: true,
            newPost: response.data.post 
          }
        })
      }, 800)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create post')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3"
      >
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/home')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">New Post</h1>
          <motion.button
            onClick={handleSubmit}
            disabled={isLoading || (!content.trim() && !image)}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Post</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>
      </motion.header>

      {/* Create Post Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-lg mx-auto p-4"
      >
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* User Info */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5">
              <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                {profile?.profileImage ? (
                  <img 
                    src={profile.profileImage} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">{profile?.name?.[0] || 'U'}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{profile?.name || 'User'}</h3>
              <p className="text-xs text-gray-500">{profile?.stream || 'Student'}</p>
            </div>
          </div>

          {/* Content Input */}
          <div className="p-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={6}
              className="w-full resize-none outline-none text-lg placeholder-gray-400"
              maxLength={500}
            />
            <p className="text-right text-xs text-gray-400 mt-2">
              {content.length}/500
            </p>
          </div>

          {/* Image Preview */}
          {previewUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative mx-4 mb-4"
            >
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full max-h-80 object-cover rounded-xl"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-4 pb-4 text-red-500 text-sm"
            >
              {error}
            </motion.p>
          )}

          {/* Success */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 pb-4 flex items-center gap-2 text-green-600"
            >
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Post created successfully!</span>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 p-4 border-t border-gray-100">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-colors"
            >
              <Image className="w-5 h-5" />
              <span className="text-sm font-medium">Add Photo</span>
            </motion.button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>
      </motion.div>

      <BottomNav />
    </div>
  )
}

export default CreatePost
