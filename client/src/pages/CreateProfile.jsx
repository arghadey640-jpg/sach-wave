import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Camera, User, Calendar, Hash, BookOpen, FileText, ArrowRight, Check, Image } from 'lucide-react'

const ACCENT_COLORS = [
  { name: 'Purple', value: 'purple', class: 'from-purple-600 to-blue-600' },
  { name: 'Pink', value: 'pink', class: 'from-pink-500 to-rose-500' },
  { name: 'Green', value: 'green', class: 'from-emerald-500 to-teal-500' },
  { name: 'Orange', value: 'orange', class: 'from-orange-500 to-red-500' },
  { name: 'Blue', value: 'blue', class: 'from-blue-500 to-cyan-500' },
]

const CreateProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    rollNumber: '',
    stream: '',
    bio: ''
  })
  const [profileImage, setProfileImage] = useState(null)
  const [profilePreview, setProfilePreview] = useState(null)
  const [coverImage, setCoverImage] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [accentColor, setAccentColor] = useState('purple')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const profileInputRef = useRef(null)
  const coverInputRef = useRef(null)
  const navigate = useNavigate()
  const { createProfile } = useAuth()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB')
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result)
        setProfilePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Cover image size should be less than 10MB')
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImage(reader.result)
        setCoverPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (step === 1) {
      if (!formData.name || !formData.dateOfBirth || !formData.rollNumber || !formData.stream) {
        setError('Please fill in all required fields')
        return
      }
      setStep(2)
      return
    }

    setIsLoading(true)
    setError('')

    const profileData = {
      ...formData,
      profileImage: profileImage || null,
      coverImage: coverImage || null,
      accentColor
    }

    const result = await createProfile(profileData)
    
    if (result.success) {
      navigate('/home')
    } else {
      setError(result.error)
    }
    
    setIsLoading(false)
  }

  const streams = ['Science', 'Commerce', 'Arts', 'Engineering', 'Medical', 'Law', 'Other']

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white">Create Profile</h1>
          <p className="text-purple-200 mt-1">Step {step} of 2</p>
          
          {/* Progress Bar */}
          <div className="flex gap-2 mt-4 justify-center">
            <div className={`h-1.5 w-12 rounded-full ${step >= 1 ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`h-1.5 w-12 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/30'}`} />
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                {/* Cover Image Upload */}
                <div className="mb-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => coverInputRef.current?.click()}
                    className="relative cursor-pointer h-32 rounded-xl overflow-hidden"
                  >
                    {coverPreview ? (
                      <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center">
                        <div className="text-center">
                          <Image className="w-8 h-8 text-white/70 mx-auto mb-1" />
                          <span className="text-white/70 text-sm">Add Cover Photo</span>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="hidden"
                    />
                  </motion.div>
                </div>

                {/* Profile Image Upload */}
                <div className="flex justify-center -mt-12 mb-2 relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => profileInputRef.current?.click()}
                    className="relative cursor-pointer"
                  >
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg ${profilePreview ? '' : 'bg-gray-100'}`}>
                      {profilePreview ? (
                        <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <Camera className="w-3.5 h-3.5 text-white" />
                    </div>
                    <input
                      ref={profileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />
                  </motion.div>
                </div>
                <p className="text-center text-sm text-gray-500 mb-4">Tap to upload photos</p>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Roll Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Roll Number *
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleChange}
                      placeholder="Enter your roll number"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Stream */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stream *
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="stream"
                      value={formData.stream}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white transition-all outline-none appearance-none"
                      required
                    >
                      <option value="">Select your stream</option>
                      {streams.map(stream => (
                        <option key={stream} value={stream}>{stream}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Accent Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Profile Theme Color
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {ACCENT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setAccentColor(color.value)}
                        className={`w-12 h-12 rounded-full bg-gradient-to-r ${color.class} ${accentColor === color.value ? 'ring-4 ring-offset-2 ring-purple-400' : ''} transition-all`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      maxLength={150}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white transition-all outline-none resize-none"
                    />
                    <p className="text-right text-xs text-gray-400 mt-1">
                      {formData.bio.length}/150
                    </p>
                  </div>
                </div>

                {/* Preview Card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl"
                >
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Profile Preview</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center overflow-hidden">
                      {previewUrl ? (
                        <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{formData.name || 'Your Name'}</p>
                      <p className="text-sm text-gray-500">{formData.stream || 'Stream'} • Roll: {formData.rollNumber || '---'}</p>
                    </div>
                  </div>
                </motion.div>
              </>
            )}

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg"
              >
                {error}
              </motion.p>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              {step === 2 && (
                <motion.button
                  type="button"
                  onClick={() => setStep(1)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex-1 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Back
                </motion.button>
              )}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-shadow disabled:opacity-70"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : step === 1 ? (
                  <>
                    <span>Next</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    <span>Complete</span>
                    <Check className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default CreateProfile
