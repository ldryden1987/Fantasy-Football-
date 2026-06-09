const Notification = require('../models/Notification');

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
    res.json(notifications)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      read: false
    })
    res.json({ count })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true })
    res.json({ message: 'Marked as read' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// PUT /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    )
    res.json({ message: 'All notifications marked as read' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id)
    res.json({ message: 'Notification deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Helper to create notifications (used by other controllers)
const createNotification = async ({ user, league, type, title, message, link }) => {
  try {
    await Notification.create({ user, league, type, title, message, link })
  } catch (err) {
    console.error('Error creating notification:', err.message)
  }
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
}
