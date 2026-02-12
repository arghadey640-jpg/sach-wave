import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Compass, PlusCircle, MessageCircle, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import axios from 'axios'

const BottomNav = () => {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/api/messages/unread/count')
      setUnreadCount(response.data.unreadCount)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const navItems = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/explore', icon: Compass, label: 'Explore' },
    { to: '/create', icon: PlusCircle, label: 'Create', isCenter: true },
    { to: '/messages', icon: MessageCircle, label: 'Messages', badge: unreadCount },
    { to: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-gray-200 safe-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200
              ${isActive ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'}
              ${item.isCenter ? '-mt-6' : ''}
            `}
          >
            {({ isActive }) => (
              <>
                {item.isCenter ? (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30"
                  >
                    <item.icon className="w-7 h-7 text-white" />
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      whileTap={{ scale: 0.8 }}
                      className="relative"
                    >
                      <item.icon className={`w-6 h-6 ${isActive ? 'text-purple-600' : ''}`} />
                      {item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-600 rounded-full"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </motion.div>
                    <span className={`text-xs mt-1 ${isActive ? 'font-medium' : ''}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
