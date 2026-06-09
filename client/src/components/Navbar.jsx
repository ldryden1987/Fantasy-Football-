import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLeague } from '../context/LeagueContext'
import { useNotifications } from '../context/NotificationContext'
import { useNavigate, Link } from 'react-router-dom'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { activeLeague } = useLeague()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinks = activeLeague ? [
    { label: '🏟️ League', path: `/league/${activeLeague._id}` },
    { label: '📋 Roster', path: `/league/${activeLeague._id}/roster` },
    { label: '🏈 Players', path: `/league/${activeLeague._id}/players` },
    { label: '🎯 Draft', path: `/league/${activeLeague._id}/draft` },
    { label: '📺 Scoring', path: `/league/${activeLeague._id}/scoring` },
    { label: '📊 Standings', path: `/league/${activeLeague._id}/standings` },
    { label: '🔄 Trades', path: `/league/${activeLeague._id}/trades` },
    { label: '📥 Waivers', path: `/league/${activeLeague._id}/waivers` },
    { label: '🤖 AI', path: `/league/${activeLeague._id}/trade-analyzer` },
    { label: '📰 News', path: '/news' },
  ] : []

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">

          {/* Logo */}
          <Link to="/dashboard" className="text-xl font-bold text-green-400 shrink-0">
            🏈 Fantasy
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-300 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <Link to="/notifications" className="relative">
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User */}
            <span className="text-gray-400 text-sm hidden md:block">
              {user?.username}
            </span>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-gray-400 hover:text-white p-1"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden mt-3 pb-3 border-t border-gray-700 pt-3 grid grid-cols-3 gap-2">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className="text-gray-300 hover:text-white text-xs px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-center"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
