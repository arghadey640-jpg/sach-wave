import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios.js'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      if (token && storedUser) {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        setIsAuthenticated(true)
        await fetchProfile(parsedUser.id)
      }
      setLoading(false)
    }
    
    initAuth()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const response = await api.get(`/profile/${userId}`)
      if (response.data.profile) {
        setProfile(response.data.profile)
        setHasProfile(true)
      }
    } catch (error) {
      console.log('No profile found')
      setHasProfile(false)
    }
  }

  const verifyAccessCode = (code) => {
    return code === 'sachad26'
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      setUser(user)
      setIsAuthenticated(true)
      
      await fetchProfile(user.id)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const signup = async (email, password) => {
    try {
      const response = await api.post('/auth/signup', { email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      setUser(user)
      setIsAuthenticated(true)
      setHasProfile(false)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Signup failed' 
      }
    }
  }

  const createProfile = async (profileData) => {
    try {
      const response = await api.post('/profile', profileData)
      setProfile(response.data.profile)
      setHasProfile(true)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create profile' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setProfile(null)
    setIsAuthenticated(false)
    setHasProfile(false)
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put(`/profile/${user.id}`, profileData)
      setProfile(response.data.profile)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update profile' 
      }
    }
  }

  const value = {
    user,
    profile,
    isAuthenticated,
    hasProfile,
    loading,
    login,
    signup,
    logout,
    createProfile,
    updateProfile,
    verifyAccessCode,
    isAdmin: user?.role === 'admin' || user?.role === 'owner'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
