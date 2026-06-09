import { createContext, useContext, useState, useEffect } from 'react'
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '../services/notificationService'
import { useAuth } from './AuthContext'

const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      fetchNotifications()
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications()
      setNotifications(res.data)
      setUnreadCount(res.data.filter(n => !n.read).length)
    } catch (err) {
      console.error('Error fetching notifications:', err)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount()
      setUnreadCount(res.data.count)
    } catch (err) {
      console.error('Error fetching unread count:', err)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id)
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id)
      setNotifications(prev => prev.filter(n => n._id !== id))
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      fetchNotifications,
      markAsRead: handleMarkAsRead,
      markAllAsRead: handleMarkAllAsRead,
      deleteNotification: handleDelete
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
