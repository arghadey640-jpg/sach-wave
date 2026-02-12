import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { TrendingUp, Users, Hash, Search, Flame, Star } from 'lucide-react'

const Explore = () => {
  const [activeTab, setActiveTab] = useState('trending')
  const [trendingPosts, setTrendingPosts] = useState([])
  const [popularUsers, setPopularUsers] = useState([])
  const [trendingHashtags, setTrendingHashtags] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchExploreData()
  }, [])

  const fetchExploreData = async () => {
    setLoading(true)
    try {
      const [trendingRes, usersRes, hashtagsRes] = await Promise.all([
        axios.get('/api/explore/trending'),
        axios.get('/api/explore/popular-users'),
        axios.get('/api/explore/trending-hashtags')
      ])
      setTrendingPosts(trendingRes.data.posts)
      setPopularUsers(usersRes.data.users)
      setTrendingHashtags(hashtagsRes.data.hashtags)
    } catch (error) {
      console.error('Error fetching explore data:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'people', label: 'People', icon: Users },
    { id: 'hashtags', label: 'Hashtags', icon: Hash }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <motion.header
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-40 bg-white border-b border-gray-200"
      >
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users, posts, hashtags..."
                className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all
                    ${activeTab === tab.id 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="max-w-lg mx-auto p-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-20 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {activeTab === 'trending' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* Trending Posts Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {trendingPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate('/home')}
                      className="aspect-square bg-white rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                    >
                      {post.image ? (
                        <img 
                          src={post.image} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center p-4">
                          <p className="text-sm text-gray-600 line-clamp-3">{post.content}</p>
                        </div>
                      )}
                      <div className="p-2 bg-white">
                        <div className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500" />
                          <span className="text-xs text-gray-500">{post.reactionCount} reactions</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'people' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                {popularUsers.map((user, index) => (
                  <motion.div
                    key={user.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate(`/profile/${user.userId}`)}
                    className="bg-white rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5">
                        <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                          {user.profileImage ? (
                            <img 
                              src={user.profileImage} 
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 font-semibold">{user.name?.[0]}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {index < 3 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.stream}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>{user.followersCount} followers</span>
                        <span>{user.postsCount} posts</span>
                      </div>
                    </div>
                    
                    <button className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-full">
                      Follow
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'hashtags' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap gap-3"
              >
                {trendingHashtags.map((hashtag, index) => (
                  <motion.button
                    key={hashtag.tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate(`/explore/hashtag/${hashtag.tag}`)}
                    className="px-4 py-2 bg-white rounded-full border border-gray-200 hover:border-purple-500 hover:text-purple-600 transition-colors"
                  >
                    <span className="font-medium">#{hashtag.tag}</span>
                    <span className="text-gray-400 text-sm ml-2">{hashtag.count} posts</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

export default Explore
