import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Type, Image, Smile, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const EMOJIS = ['😀', '😂', '🥰', '😎', '🤔', '👍', '❤️', '🎉', '🔥', '✨', '🌟', '💯', '😍', '🤩', '😘']

const STORY_BACKGROUNDS = [
  'bg-gradient-to-br from-purple-600 to-blue-600',
  'bg-gradient-to-br from-pink-500 to-orange-400',
  'bg-gradient-to-br from-green-400 to-blue-500',
  'bg-gradient-to-br from-yellow-400 to-pink-500',
  'bg-gradient-to-br from-red-500 to-purple-600',
  'bg-gradient-to-br from-indigo-500 to-purple-500',
]

const Stories = ({ stories, loading, onStoryCreated }) => {
  const [selectedStory, setSelectedStory] = useState(null)
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createMode, setCreateMode] = useState(null) // 'image' or 'text'
  const [localStories, setLocalStories] = useState(stories)
  const [isUploading, setIsUploading] = useState(false)
  const [storyText, setStoryText] = useState('')
  const [selectedBackground, setSelectedBackground] = useState(0)
  const [showViewers, setShowViewers] = useState(false)
  const [storyViewers, setStoryViewers] = useState([])
  const { profile, user } = useAuth()

  // Update local stories when prop changes
  useEffect(() => {
    setLocalStories(stories)
  }, [stories])

  // Auto-advance story
  useEffect(() => {
    if (!selectedStory) return
    const timer = setTimeout(() => {
      handleNextStory()
    }, 5000)
    return () => clearTimeout(timer)
  }, [selectedStory, selectedStoryIndex])

  const handleCreateImageStory = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    const reader = new FileReader()
    reader.onloadend = async () => {
      try {
        const response = await axios.post('/api/stories', {
          image: reader.result,
          type: 'image'
        })
        
        const newStory = response.data.story || {
          id: Date.now(),
          image: reader.result,
          userId: user?.id,
          userName: profile?.name || 'You',
          userImage: profile?.profileImage,
          createdAt: new Date().toISOString(),
          type: 'image'
        }
        
        setLocalStories(prev => [newStory, ...prev])
        setShowCreateModal(false)
        
        if (onStoryCreated) {
          onStoryCreated()
        }
      } catch (error) {
        console.error('Error creating story:', error)
        alert('Failed to create story. Please try again.')
      } finally {
        setIsUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleCreateTextStory = async () => {
    if (!storyText.trim()) return

    setIsUploading(true)
    try {
      const response = await axios.post('/api/stories', {
        content: storyText,
        background: selectedBackground,
        type: 'text'
      })
      
      const newStory = response.data.story || {
        id: Date.now(),
        content: storyText,
        background: selectedBackground,
        userId: user?.id,
        userName: profile?.name || 'You',
        userImage: profile?.profileImage,
        createdAt: new Date().toISOString(),
        type: 'text'
      }
      
      setLocalStories(prev => [newStory, ...prev])
      setStoryText('')
      setShowCreateModal(false)
      setCreateMode(null)
      
      if (onStoryCreated) {
        onStoryCreated()
      }
    } catch (error) {
      console.error('Error creating story:', error)
      alert('Failed to create story. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleStoryClick = (story, index) => {
    setSelectedStory(story)
    setSelectedStoryIndex(index)
    // Record view
    if (story.userId !== user?.id) {
      axios.post(`/api/stories/${story.id}/view`).catch(console.error)
    }
  }

  const handleNextStory = () => {
    if (selectedStoryIndex < localStories.length - 1) {
      setSelectedStoryIndex(prev => prev + 1)
      setSelectedStory(localStories[selectedStoryIndex + 1])
    } else {
      setSelectedStory(null)
      setSelectedStoryIndex(0)
    }
  }

  const handlePrevStory = () => {
    if (selectedStoryIndex > 0) {
      setSelectedStoryIndex(prev => prev - 1)
      setSelectedStory(localStories[selectedStoryIndex - 1])
    }
  }

  const fetchStoryViewers = async (storyId) => {
    try {
      const response = await axios.get(`/api/stories/${storyId}/viewers`)
      setStoryViewers(response.data.viewers || [])
    } catch (error) {
      console.error('Error fetching viewers:', error)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  }

  if (loading) {
    return (
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="flex gap-4 px-4 overflow-x-auto hide-scrollbar">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
              <div className="w-12 h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white border-b border-gray-200 py-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex gap-4 px-4 overflow-x-auto hide-scrollbar"
        >
          {/* Add Story Button */}
          <motion.div
            variants={itemVariants}
            className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer"
            onClick={() => setShowCreateModal(true)}
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-purple-400 flex items-center justify-center bg-purple-50 hover:bg-purple-100 transition-colors">
                {profile?.profileImage ? (
                  <img 
                    src={profile.profileImage} 
                    alt="" 
                    className="w-full h-full rounded-full object-cover opacity-50"
                  />
                ) : (
                  <Plus className="w-6 h-6 text-purple-600" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center border-2 border-white">
                <Plus className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className="text-xs text-gray-600 font-medium">Add Story</span>
          </motion.div>

          {/* Story Items */}
          {localStories.map((story, index) => (
            <motion.div
              key={story.id}
              variants={itemVariants}
              className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer"
              onClick={() => handleStoryClick(story, index)}
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full p-0.5 story-ring">
                  <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                    {story.type === 'text' ? (
                      <div className={`w-full h-full ${STORY_BACKGROUNDS[story.background || 0]} flex items-center justify-center`}>
                        <span className="text-white text-2xl">Aa</span>
                      </div>
                    ) : (
                      <img 
                        src={story.userImage || '/default-avatar.png'} 
                        alt={story.userName}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-600 truncate max-w-[64px]">
                {story.userName?.split(' ')[0] || 'User'}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Create Story Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => {
              setShowCreateModal(false)
              setCreateMode(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {!createMode ? (
                <>
                  <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Create Story</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setCreateMode('image')}
                      className="flex flex-col items-center gap-3 p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                    >
                      <Image className="w-8 h-8 text-purple-600" />
                      <span className="font-medium text-gray-700">Photo</span>
                    </button>
                    <button
                      onClick={() => setCreateMode('text')}
                      className="flex flex-col items-center gap-3 p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      <Type className="w-8 h-8 text-blue-600" />
                      <span className="font-medium text-gray-700">Text</span>
                    </button>
                  </div>
                </>
              ) : createMode === 'image' ? (
                <>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Upload Photo</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCreateImageStory}
                      className="hidden"
                      id="story-image-upload"
                    />
                    <label
                      htmlFor="story-image-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Image className="w-12 h-12 text-gray-400" />
                      <span className="text-gray-600">Click to upload photo</span>
                    </label>
                  </div>
                  {isUploading && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-gray-600">Uploading...</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Create Text Story</h3>
                  <div className={`${STORY_BACKGROUNDS[selectedBackground]} rounded-xl p-6 mb-4 min-h-[200px] flex items-center justify-center`}>
                    <textarea
                      value={storyText}
                      onChange={(e) => setStoryText(e.target.value)}
                      placeholder="Type your story..."
                      className="w-full bg-transparent text-white text-center text-xl font-medium placeholder-white/70 resize-none outline-none"
                      rows={3}
                      maxLength={100}
                    />
                  </div>
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {STORY_BACKGROUNDS.map((bg, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedBackground(idx)}
                        className={`w-10 h-10 rounded-full ${bg} flex-shrink-0 ${selectedBackground === idx ? 'ring-2 ring-offset-2 ring-purple-600' : ''}`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setStoryText(prev => prev + emoji)}
                        className="text-2xl hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleCreateTextStory}
                    disabled={!storyText.trim() || isUploading}
                    className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium disabled:opacity-50"
                  >
                    {isUploading ? 'Posting...' : 'Post Story'}
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setCreateMode(null)
                }}
                className="w-full mt-3 py-3 text-gray-600 font-medium"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          >
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
              <motion.div
                key={selectedStory?.id}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 5, ease: 'linear' }}
                className="h-full bg-white"
              />
            </div>

            {/* Navigation */}
            {selectedStoryIndex > 0 && (
              <button
                onClick={handlePrevStory}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 z-10"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}
            {selectedStoryIndex < localStories.length - 1 && (
              <button
                onClick={handleNextStory}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 z-10"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}

            <button 
              className="absolute top-4 right-4 text-white p-2 z-10"
              onClick={() => setSelectedStory(null)}
            >
              <X className="w-8 h-8" />
            </button>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md h-full max-h-[80vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedStory.type === 'text' ? (
                <div className={`w-full h-full ${STORY_BACKGROUNDS[selectedStory.background || 0]} flex items-center justify-center p-8`}>
                  <p className="text-white text-2xl font-medium text-center">{selectedStory.content}</p>
                </div>
              ) : selectedStory.image ? (
                <img 
                  src={selectedStory.image} 
                  alt="Story" 
                  className="w-full h-full object-contain"
                />
              ) : null}
              
              {/* Story Header */}
              <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedStory.userImage || '/default-avatar.png'} 
                      alt=""
                      className="w-10 h-10 rounded-full border-2 border-white"
                    />
                    <span className="text-white font-medium">{selectedStory.userName}</span>
                  </div>
                  {selectedStory.userId === user?.id && (
                    <button
                      onClick={() => {
                        fetchStoryViewers(selectedStory.id)
                        setShowViewers(true)
                      }}
                      className="flex items-center gap-1 text-white/80 hover:text-white"
                    >
                      <Eye className="w-5 h-5" />
                      <span className="text-sm">Views</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Viewers Modal */}
            <AnimatePresence>
              {showViewers && (
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[50vh] overflow-hidden"
                >
                  <div className="p-4 border-b">
                    <h3 className="font-bold text-gray-800">Viewers ({storyViewers.length})</h3>
                  </div>
                  <div className="overflow-y-auto max-h-[40vh]">
                    {storyViewers.length === 0 ? (
                      <p className="p-4 text-center text-gray-500">No views yet</p>
                    ) : (
                      storyViewers.map((viewer) => (
                        <div key={viewer.id} className="flex items-center gap-3 p-3 border-b">
                          <img
                            src={viewer.userImage || '/default-avatar.png'}
                            alt={viewer.userName}
                            className="w-10 h-10 rounded-full"
                          />
                          <span className="font-medium">{viewer.userName}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    onClick={() => setShowViewers(false)}
                    className="w-full py-3 text-purple-600 font-medium border-t"
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Stories
