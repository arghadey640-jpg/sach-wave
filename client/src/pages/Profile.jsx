import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'
import FollowButton from '../components/FollowButton'
import PointsBadge from '../components/PointsBadge'
import { Settings, LogOut, Grid, User as UserIcon, Mail, Hash, Calendar, Edit3, MessageCircle, Crown, Shield } from 'lucide-react'
import axios from 'axios'

const ACCENT_GRADIENTS = {
  purple: 'bg-gradient-to-r from-purple-600 to-blue-600',
  pink: 'bg-gradient-to-r from-pink-500 to-rose-500',
  green: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  orange: 'bg-gradient-to-r from-orange-500 to-red-500',
  blue: 'bg-gradient-to-r from-blue-500 to-cyan-500'
}

const getAccentGradient = (color) => ACCENT_GRADIENTS[color] || ACCENT_GRADIENTS.purple

const Profile = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user, profile: currentUserProfile, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [followerStats, setFollowerStats] = useState({ followers: 0, following: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('posts')
  const isOwnProfile = !userId || userId === user?.id

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const targetId = userId || user?.id
        const [profileRes, postsRes, followersRes] = await Promise.all([
          axios.get(`/api/profile/${targetId}`),
          axios.get(`/api/posts/user/${targetId}`),
          axios.get(`/api/followers/${targetId}/count`)
        ])
        setProfile(profileRes.data.profile)
        setPosts(postsRes.data.posts || [])
        setFollowerStats(followersRes.data)
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchProfile()
    }
  }, [userId, user])

  const handleFollowChange = (isFollowing) => {
    setFollowerStats(prev => ({
      ...prev,
      followers: isFollowing ? prev.followers + 1 : prev.followers - 1
    }))
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const displayProfile = isOwnProfile ? currentUserProfile : profile

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200" />
          <div className="px-4 py-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full -mt-16 border-4 border-white" />
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  if (!displayProfile) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Profile not found</p>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Background / Cover Image */}
      <div className={`h-40 ${displayProfile.coverImage ? '' : getAccentGradient(displayProfile.accentColor)} relative`}>
        {displayProfile.coverImage && (
          <img 
            src={displayProfile.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
      </div>

      {/* Profile Info */}
      <div className="px-4 pb-4">
        <div className="flex items-end gap-4 -mt-12 mb-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
              {displayProfile.profileImage ? (
                <img 
                  src={displayProfile.profileImage} 
                  alt={displayProfile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
          </motion.div>

          <div className="flex-1 pb-2">
            {isOwnProfile ? (
              <div className="flex gap-2 justify-end">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/create-profile')}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </motion.button>
              </div>
            ) : (
              <div className="flex gap-2 justify-end">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/messages?user=${profile?.userId}`)}
                  className="p-2 bg-white border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50"
                >
                  <MessageCircle className="w-5 h-5" />
                </motion.button>
                <FollowButton 
                  userId={profile?.userId} 
                  onFollowChange={handleFollowChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* User Details */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-800">{displayProfile.name}</h1>
            {isOwnProfile && <PointsBadge />}
            {/* Role Badges */}
            {displayProfile.role === 'owner' && (
              <span className="inline-flex items-center gap-1 text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full font-medium">
                <Crown className="w-3 h-3" />
                Owner
              </span>
            )}
            {displayProfile.role === 'admin' && (
              <span className="inline-flex items-center gap-1 text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded-full font-medium">
                <Shield className="w-3 h-3" />
                Admin
              </span>
            )}
          </div>
          <p className="text-gray-500">{displayProfile.stream}</p>
          
          {displayProfile.bio && (
            <p className="mt-3 text-gray-700">{displayProfile.bio}</p>
          )}

          {/* Stats */}
          <div className="flex gap-6 mt-4 py-4 border-y border-gray-200">
            <div className="text-center">
              <p className="font-bold text-gray-800">{posts.length}</p>
              <p className="text-sm text-gray-500">Posts</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-800">{followerStats.followers}</p>
              <p className="text-sm text-gray-500">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-800">{followerStats.following}</p>
              <p className="text-sm text-gray-500">Following</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 space-y-2">
            {displayProfile.rollNumber && (
              <div className="flex items-center gap-2 text-gray-600">
                <Hash className="w-4 h-4" />
                <span className="text-sm">Roll: {displayProfile.rollNumber}</span>
              </div>
            )}
            {displayProfile.dateOfBirth && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">DOB: {new Date(displayProfile.dateOfBirth).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex mt-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'posts' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'
            }`}
          >
            <Grid className="w-5 h-5 mx-auto mb-1" />
            Posts
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeTab === 'settings' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'
              }`}
            >
              <Settings className="w-5 h-5 mx-auto mb-1" />
              Settings
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === 'posts' ? (
            posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Grid className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No posts yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="aspect-square bg-gray-100 overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/home`)}
                  >
                    {post.image ? (
                      <img 
                        src={post.image} 
                        alt="" 
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-2">
                        <p className="text-xs text-gray-600 line-clamp-3">{post.content}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              <button className="w-full flex items-center gap-3 p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
                <span className="flex-1 text-left">Settings</span>
              </button>
              <button className="w-full flex items-center gap-3 p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors">
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="flex-1 text-left">Privacy</span>
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-4 bg-white rounded-xl hover:bg-red-50 text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="flex-1 text-left font-medium">Logout</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

export default Profile
