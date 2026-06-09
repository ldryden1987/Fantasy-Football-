import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../context/NotificationContext'
import Navbar from '../components/Navbar'

const typeIcons = {
  trade_offer: '🔄',
  trade_accepted: '✅',
  trade_rejected: '❌',
  trade_vetoed: '🚫',
  waiver_processed: '📥',
  waiver_denied: '❌',
  draft_turn: '🎯',
  draft_completed: '🏈',
  league_joined: '🏟️',
  general: '📢'
}

const Notifications = () => {
  const navigate = useNavigate()
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications()

  const handleClick = async (notification) => {
    if (!notification.read) await markAsRead(notification._id)
    if (notification.link) navigate(notification.link)
  }

  const unread = notifications.filter(n => !n.read)
  const read = notifications.filter(n => n.read)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">🔔 Notifications</h2>
            <p className="text-gray-400 mt-1">
              {unread.length} unread notification{unread.length !== 1 ? 's' : ''}
            </p>
          </div>
          {unread.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-gray-800 border border-dashed border-gray-700 rounded-2xl p-16 text-center">
            <p className="text-5xl mb-4">🔔</p>
            <p className="text-gray-400">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Unread */}
            {unread.length > 0 && (
              <>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider px-1">
                  Unread
                </p>
                {unread.map(notification => (
                  <NotificationCard
                    key={notification._id}
                    notification={notification}
                    onClick={() => handleClick(notification)}
                    onDelete={() => deleteNotification(notification._id)}
                  />
                ))}
              </>
            )}

            {/* Read */}
            {read.length > 0 && (
              <>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider px-1 mt-6">
                  Earlier
                </p>
                {read.map(notification => (
                  <NotificationCard
                    key={notification._id}
                    notification={notification}
                    onClick={() => handleClick(notification)}
                    onDelete={() => deleteNotification(notification._id)}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const NotificationCard = ({ notification, onClick, onDelete }) => {
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div
      className={`relative rounded-2xl p-5 cursor-pointer transition-colors ${
        notification.read
          ? 'bg-gray-800 hover:bg-gray-750'
          : 'bg-gray-800 border border-green-500/30 hover:border-green-500/60'
      }`}
      onClick={onClick}
    >
      {!notification.read && (
        <span className="absolute top-4 right-4 w-2 h-2 bg-green-400 rounded-full" />
      )}
      <div className="flex items-start gap-4 pr-6">
        <span className="text-2xl">
          {typeIcons[notification.type] || '📢'}
        </span>
        <div className="flex-1">
          <p className="font-bold">{notification.title}</p>
          <p className="text-gray-400 text-sm mt-1">{notification.message}</p>
          <p className="text-gray-500 text-xs mt-2">{timeAgo(notification.createdAt)}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="text-gray-600 hover:text-red-400 transition-colors text-lg"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default Notifications
