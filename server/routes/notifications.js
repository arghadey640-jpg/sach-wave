import express from 'express'
import { getNotifications, saveNotifications } from '../utils/dataStore.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Get user notifications
router.get('/', authenticate, (req, res) => {
  try {
    const notifications = getNotifications()
    const userNotifications = notifications
      .filter(n => n.userId === req.user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50)

    res.json({ notifications: userNotifications })
  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Mark notification as read
router.put('/:notificationId/read', authenticate, (req, res) => {
  try {
    const notifications = getNotifications()
    const index = notifications.findIndex(n => n.id === req.params.notificationId)

    if (index === -1) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    if (notifications[index].userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    notifications[index].read = true
    saveNotifications(notifications)

    res.json({ message: 'Notification marked as read' })
  } catch (error) {
    console.error('Mark read error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Mark all notifications as read
router.put('/read-all', authenticate, (req, res) => {
  try {
    const notifications = getNotifications()
    notifications.forEach(n => {
      if (n.userId === req.user.id) {
        n.read = true
      }
    })
    saveNotifications(notifications)
    res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    console.error('Mark all read error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete notification
router.delete('/:notificationId', authenticate, (req, res) => {
  try {
    const notifications = getNotifications()
    const index = notifications.findIndex(n => n.id === req.params.notificationId)

    if (index === -1) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    if (notifications[index].userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    notifications.splice(index, 1)
    saveNotifications(notifications)

    res.json({ message: 'Notification deleted' })
  } catch (error) {
    console.error('Delete notification error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Clear all notifications
router.delete('/clear-all', authenticate, (req, res) => {
  try {
    const notifications = getNotifications()
    const filtered = notifications.filter(n => n.userId !== req.user.id)
    saveNotifications(filtered)
    res.json({ message: 'All notifications cleared' })
  } catch (error) {
    console.error('Clear all error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
