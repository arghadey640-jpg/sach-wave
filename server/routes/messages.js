import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getMessages, saveMessages, getProfiles, getChatSessions, saveChatSessions } from '../utils/dataStore.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Get user's conversations
router.get('/conversations', authenticate, (req, res) => {
  try {
    const messages = getMessages()
    const profiles = getProfiles()
    const userId = req.user.id

    // Get all unique conversations
    const conversations = []
    const processedUsers = new Set()

    messages
      .filter(m => m.senderId === userId || m.receiverId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .forEach(m => {
        const otherUserId = m.senderId === userId ? m.receiverId : m.senderId
        
        if (!processedUsers.has(otherUserId)) {
          processedUsers.add(otherUserId)
          const profile = profiles.find(p => p.userId === otherUserId)
          const unreadCount = messages.filter(
            msg => msg.senderId === otherUserId && msg.receiverId === userId && !msg.read
          ).length

          conversations.push({
            userId: otherUserId,
            name: profile?.name || 'Unknown',
            profileImage: profile?.profileImage,
            lastMessage: m.content,
            lastMessageTime: m.timestamp,
            unreadCount,
            isOnline: false // Will be updated with online status
          })
        }
      })

    res.json({ conversations })
  } catch (error) {
    console.error('Get conversations error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get chat history with specific user
router.get('/:userId', authenticate, (req, res) => {
  try {
    const messages = getMessages()
    const profiles = getProfiles()
    const currentUserId = req.user.id
    const otherUserId = req.params.userId

    const chatHistory = messages
      .filter(m => 
        (m.senderId === currentUserId && m.receiverId === otherUserId) ||
        (m.senderId === otherUserId && m.receiverId === currentUserId)
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(m => {
        const senderProfile = profiles.find(p => p.userId === m.senderId)
        return {
          ...m,
          senderName: senderProfile?.name,
          senderImage: senderProfile?.profileImage
        }
      })

    // Mark messages as read
    const updatedMessages = messages.map(m => {
      if (m.receiverId === currentUserId && m.senderId === otherUserId && !m.read) {
        return { ...m, read: true, readAt: new Date().toISOString() }
      }
      return m
    })
    saveMessages(updatedMessages)

    res.json({ messages: chatHistory })
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Send message
router.post('/:userId', authenticate, (req, res) => {
  try {
    const { content } = req.body
    const receiverId = req.params.userId
    const senderId = req.user.id

    if (!content?.trim()) {
      return res.status(400).json({ message: 'Message content is required' })
    }

    const messages = getMessages()
    
    const newMessage = {
      id: uuidv4(),
      senderId,
      receiverId,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      read: false,
      readAt: null
    }

    messages.push(newMessage)
    saveMessages(messages)

    // Update chat session
    const sessions = getChatSessions()
    const existingSession = sessions.find(
      s => (s.user1 === senderId && s.user2 === receiverId) ||
           (s.user1 === receiverId && s.user2 === senderId)
    )

    if (existingSession) {
      existingSession.lastMessage = newMessage.timestamp
      existingSession.updatedAt = newMessage.timestamp
    } else {
      sessions.push({
        id: uuidv4(),
        user1: senderId,
        user2: receiverId,
        lastMessage: newMessage.timestamp,
        createdAt: newMessage.timestamp,
        updatedAt: newMessage.timestamp
      })
    }
    saveChatSessions(sessions)

    res.status(201).json({ message: 'Message sent', data: newMessage })
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Mark message as read
router.put('/:messageId/read', authenticate, (req, res) => {
  try {
    const messages = getMessages()
    const index = messages.findIndex(m => m.id === req.params.messageId)

    if (index === -1) {
      return res.status(404).json({ message: 'Message not found' })
    }

    if (messages[index].receiverId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    messages[index].read = true
    messages[index].readAt = new Date().toISOString()
    saveMessages(messages)

    res.json({ message: 'Message marked as read' })
  } catch (error) {
    console.error('Mark read error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Send typing indicator
router.post('/:userId/typing', authenticate, (req, res) => {
  try {
    const { isTyping } = req.body
    // In a real app with WebSockets, this would broadcast to the receiver
    // For now, we'll just acknowledge
    res.json({ success: true, isTyping })
  } catch (error) {
    console.error('Typing indicator error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get online status (simulated)
router.get('/online-status/:userId', authenticate, (req, res) => {
  try {
    // In a real app, this would check WebSocket connections
    // For now, simulate random online status
    const isOnline = Math.random() > 0.5
    const lastSeen = isOnline ? null : new Date(Date.now() - Math.random() * 3600000).toISOString()
    
    res.json({ isOnline, lastSeen })
  } catch (error) {
    console.error('Get online status error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get unread message count
router.get('/unread/count', authenticate, (req, res) => {
  try {
    const messages = getMessages()
    const unreadCount = messages.filter(
      m => m.receiverId === req.user.id && !m.read
    ).length

    res.json({ unreadCount })
  } catch (error) {
    console.error('Get unread count error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
