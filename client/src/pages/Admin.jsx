import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Users, FileText, Ban, Trash2, Search, RefreshCw, AlertTriangle, CheckCircle, Shield, TrendingUp, Heart, MessageCircle, Eye, BarChart3, Crown, UserCheck, UserX, ShieldAlert } from 'lucide-react'
import axios from 'axios'

const Admin = () => {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(null)
  const navigate = useNavigate()
  const { isAdmin, user } = useAuth()
  const isOwner = user?.role === 'owner'

  useEffect(() => {
    if (!isAdmin) {
      navigate('/home')
      return
    }
    fetchData()
  }, [isAdmin])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersRes, postsRes, analyticsRes] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/posts'),
        axios.get('/api/admin/analytics')
      ])
      setUsers(usersRes.data.users || [])
      setPosts(postsRes.data.posts || [])
      setAnalytics(analyticsRes.data)
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`/api/admin/users/${userId}`)
      setUsers(users.filter(u => u.id !== userId))
      setShowConfirmModal(null)
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const handleSuspendUser = async (userId) => {
    try {
      await axios.put(`/api/admin/users/${userId}/suspend`)
      setUsers(users.map(u => u.id === userId ? { ...u, suspended: !u.suspended } : u))
    } catch (error) {
      console.error('Error suspending user:', error)
    }
  }

  // Owner-only functions
  const handleGrantAdmin = async (userId) => {
    try {
      await axios.put(`/api/admin/users/${userId}/grant-admin`)
      setUsers(users.map(u => u.id === userId ? { ...u, role: 'admin' } : u))
    } catch (error) {
      console.error('Error granting admin:', error)
    }
  }

  const handleRevokeAdmin = async (userId) => {
    try {
      await axios.put(`/api/admin/users/${userId}/revoke-admin`)
      setUsers(users.map(u => u.id === userId ? { ...u, role: 'user' } : u))
    } catch (error) {
      console.error('Error revoking admin:', error)
    }
  }

  const handleBanUser = async (userId) => {
    try {
      await axios.put(`/api/admin/users/${userId}/ban`)
      setUsers(users.map(u => u.id === userId ? { ...u, banned: true } : u))
      setShowConfirmModal(null)
    } catch (error) {
      console.error('Error banning user:', error)
    }
  }

  const handleUnbanUser = async (userId) => {
    try {
      await axios.put(`/api/admin/users/${userId}/unban`)
      setUsers(users.map(u => u.id === userId ? { ...u, banned: false } : u))
    } catch (error) {
      console.error('Error unbanning user:', error)
    }
  }

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`/admin/posts/${postId}`)
      setPosts(posts.filter(p => p.id !== postId))
      setShowConfirmModal(null)
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPosts = posts.filter(post =>
    post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Posts', value: posts.length, icon: FileText, color: 'bg-green-500' },
    { label: 'Suspended', value: users.filter(u => u.suspended).length, icon: Ban, color: 'bg-red-500' },
    { label: 'Engagement', value: analytics ? `${analytics.engagementRate}%` : '0%', icon: TrendingUp, color: 'bg-purple-500' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className={`text-white px-4 py-6 ${isOwner ? 'bg-gradient-to-r from-yellow-600 to-orange-600' : 'bg-gradient-to-r from-purple-600 to-blue-600'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            {isOwner ? <Crown className="w-8 h-8" /> : <Shield className="w-8 h-8" />}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">Admin Panel</h1>
                {isOwner && (
                  <span className="bg-yellow-500 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Owner
                  </span>
                )}
              </div>
              <p className="text-purple-200 text-sm">Manage users and content</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-4"
              >
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-2`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-purple-200 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'users' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="w-5 h-5" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'posts' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-5 h-5" />
            Posts
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'analytics' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Analytics
          </button>
          <button
            onClick={fetchData}
            className="ml-auto flex items-center gap-2 px-4 py-3 bg-white text-gray-600 rounded-xl hover:bg-gray-100 transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : activeTab === 'analytics' ? (
          <div className="space-y-6">
            {/* Engagement Stats */}
            <div className="grid grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{analytics?.totalLikes || 0}</p>
                    <p className="text-gray-500">Total Likes</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{analytics?.totalComments || 0}</p>
                    <p className="text-gray-500">Total Comments</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Eye className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{analytics?.totalViews || 0}</p>
                    <p className="text-gray-500">Story Views</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Top Content */}
            <div className="grid grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Posts</h3>
                <div className="space-y-3">
                  {analytics?.topPosts?.slice(0, 5).map((post, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{post.userName}</p>
                        <p className="text-xs text-gray-500">{post.likes} likes</p>
                      </div>
                    </div>
                  )) || <p className="text-gray-400 text-sm">No data available</p>}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Most Active Users</h3>
                <div className="space-y-3">
                  {analytics?.mostActiveUsers?.slice(0, 5).map((user, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.posts} posts</p>
                      </div>
                    </div>
                  )) || <p className="text-gray-400 text-sm">No data available</p>}
                </div>
              </motion.div>
            </div>
          </div>
        ) : activeTab === 'users' ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {filteredUsers.map((userItem, index) => (
                <motion.div
                  key={userItem.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-4 hover:bg-gray-50 ${userItem.banned ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                      {userItem.name?.[0] || userItem.email?.[0] || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800">{userItem.name || 'No Name'}</p>
                        {/* Role Badges */}
                        {userItem.role === 'owner' && (
                          <span className="inline-flex items-center gap-1 text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                            <Crown className="w-3 h-3" />
                            Owner
                          </span>
                        )}
                        {userItem.role === 'admin' && (
                          <span className="inline-flex items-center gap-1 text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{userItem.email}</p>
                      <div className="flex gap-1 mt-1">
                        {userItem.suspended && (
                          <span className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                            <Ban className="w-3 h-3" />
                            Suspended
                          </span>
                        )}
                        {userItem.banned && (
                          <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                            <ShieldAlert className="w-3 h-3" />
                            Banned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {/* Owner-only actions */}
                    {isOwner && userItem.role !== 'owner' && (
                      <>
                        {userItem.role === 'admin' ? (
                          <button
                            onClick={() => handleRevokeAdmin(userItem.id)}
                            className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                            title="Revoke Admin"
                          >
                            <UserX className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleGrantAdmin(userItem.id)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Grant Admin"
                          >
                            <UserCheck className="w-5 h-5" />
                          </button>
                        )}
                        {userItem.banned ? (
                          <button
                            onClick={() => handleUnbanUser(userItem.id)}
                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                            title="Unban User"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setShowConfirmModal({ type: 'ban', id: userItem.id, name: userItem.name || userItem.email })}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Ban User"
                          >
                            <ShieldAlert className="w-5 h-5" />
                          </button>
                        )}
                      </>
                    )}
                    {/* Regular admin actions */}
                    <button
                      onClick={() => handleSuspendUser(userItem.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        userItem.suspended 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                      }`}
                      title={userItem.suspended ? 'Unsuspend' : 'Suspend'}
                    >
                      {userItem.suspended ? <CheckCircle className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => setShowConfirmModal({ type: 'user', id: userItem.id, name: userItem.name || userItem.email })}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-800">{post.userName}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600 line-clamp-2">{post.content}</p>
                      {post.image && (
                        <img 
                          src={post.image} 
                          alt="" 
                          className="mt-2 w-32 h-32 object-cover rounded-lg"
                        />
                      )}
                    </div>
                    <button
                      onClick={() => setShowConfirmModal({ type: 'post', id: post.id })}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowConfirmModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${showConfirmModal.type === 'ban' ? 'bg-red-100' : 'bg-red-100'}`}>
                {showConfirmModal.type === 'ban' ? (
                  <ShieldAlert className="w-6 h-6 text-red-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                )}
              </div>
              <h3 className="text-xl font-bold text-center text-gray-800 mb-2">
                {showConfirmModal.type === 'ban' 
                  ? 'Ban User?' 
                  : `Delete ${showConfirmModal.type === 'user' ? 'User' : 'Post'}?`
                }
              </h3>
              <p className="text-gray-500 text-center mb-6">
                {showConfirmModal.type === 'ban'
                  ? `Are you sure you want to permanently ban ${showConfirmModal.name}? This user will not be able to access the platform.`
                  : showConfirmModal.type === 'user' 
                    ? `Are you sure you want to delete ${showConfirmModal.name}? This action cannot be undone.`
                    : 'Are you sure you want to delete this post? This action cannot be undone.'
                }
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (showConfirmModal.type === 'user') {
                      handleDeleteUser(showConfirmModal.id)
                    } else if (showConfirmModal.type === 'ban') {
                      handleBanUser(showConfirmModal.id)
                    } else {
                      handleDeletePost(showConfirmModal.id)
                    }
                  }}
                  className="flex-1 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
                >
                  {showConfirmModal.type === 'ban' ? 'Ban' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Admin
