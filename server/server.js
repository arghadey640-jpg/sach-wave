import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from './routes/auth.js'
import profileRoutes from './routes/profile.js'
import postRoutes from './routes/posts.js'
import storyRoutes from './routes/stories.js'
import adminRoutes from './routes/admin.js'
import notificationRoutes from './routes/notifications.js'
import followerRoutes from './routes/followers.js'
import messageRoutes from './routes/messages.js'
import reactionRoutes from './routes/reactions.js'
import gamificationRoutes from './routes/gamification.js'
import exploreRoutes from './routes/explore.js'

// Load env vars
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Connect to MongoDB
connectDB()

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

// Middleware
app.use(cors(corsOptions))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/stories', storyRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/followers', followerRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/reactions', reactionRoutes)
app.use('/api/gamification', gamificationRoutes)
app.use('/api/explore', exploreRoutes)

// Serve static files from client build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')))
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'))
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
