import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { Search as SearchIcon, User, X } from 'lucide-react'
import axios from 'axios'

const Search = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const searchUsers = async () => {
      if (!query.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const response = await axios.get(`/profile/search?q=${encodeURIComponent(query)}`)
        setResults(response.data.profiles || [])
      } catch (error) {
        console.error('Error searching:', error)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(searchUsers, 300)
    return () => clearTimeout(timeoutId)
  }, [query])

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3"
      >
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-gray-800 mb-3">Search</h1>
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-12 pr-10 py-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Results */}
      <main className="max-w-lg mx-auto p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : query && results.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No users found</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {results.map((profile, index) => (
              <motion.div
                key={profile.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/profile/${profile.userId}`)}
                className="flex items-center gap-3 p-3 bg-white rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5">
                  <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                    {profile.profileImage ? (
                      <img 
                        src={profile.profileImage} 
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{profile.name}</h3>
                  <p className="text-sm text-gray-500">{profile.stream}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!query && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Find People</h3>
            <p className="text-gray-500">Search for students by name</p>
          </motion.div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

export default Search
