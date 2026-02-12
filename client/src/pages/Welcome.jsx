import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Lock, ArrowRight } from 'lucide-react'

const Welcome = () => {
  const [accessCode, setAccessCode] = useState('')
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const navigate = useNavigate()
  const { verifyAccessCode, isAuthenticated, hasProfile } = useAuth()

  // Redirect if already logged in
  if (isAuthenticated && hasProfile) {
    navigate('/home', { replace: true })
    return null
  }
  if (isAuthenticated && !hasProfile) {
    navigate('/create-profile', { replace: true })
    return null
  }

  const handleVerify = (e) => {
    e.preventDefault()
    setError('')
    setIsVerifying(true)

    setTimeout(() => {
      if (verifyAccessCode(accessCode)) {
        setIsVerified(true)
        setTimeout(() => {
          navigate('/login')
        }, 800)
      } else {
        setError('Invalid access code. Please try again.')
        setIsVerifying(false)
      }
    }, 600)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo Section */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-10"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-flex items-center justify-center w-28 h-28 bg-white/20 backdrop-blur-lg rounded-3xl mb-6 shadow-2xl overflow-hidden"
          >
            <img src="/logo.png" alt="Sach Wave Logo" className="w-20 h-20 object-contain" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">Sach Wave</h1>
          <p className="text-purple-200 text-lg">Connect. Share. Grow.</p>
        </motion.div>

        {/* Access Code Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20"
        >
          <AnimatePresence mode="wait">
            {!isVerified ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -50 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Private Access</h2>
                    <p className="text-purple-200 text-sm">Enter your access code to continue</p>
                  </div>
                </div>

                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="relative">
                    <input
                      type="password"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="Enter access code"
                      className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:border-white/50 focus:bg-white/20 transition-all outline-none text-center text-lg tracking-widest"
                      maxLength={10}
                    />
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-300 text-sm text-center"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={isVerifying || !accessCode}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-white text-purple-700 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-purple-700 border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <span>Verify Access</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </form>

                <p className="text-center text-purple-300 text-sm mt-6">
                  Need access? Contact the admin
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-20 h-20 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">Access Granted!</h3>
                <p className="text-purple-200">Redirecting to login...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-purple-300/60 text-sm mt-8"
        >
          Sach Wave 2026. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  )
}

export default Welcome
