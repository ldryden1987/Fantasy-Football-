import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLeague } from '../context/LeagueContext'
import { useNotifications } from '../context/NotificationContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate, Link } from 'react-router-dom'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { activeLeague } = useLeague()
  const { unreadCount } = useNotifications()
  const { theme, toggleTheme } = useTheme()
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
    { label: '⚙️ Commissioner', path: `/league/${activeLeague._id}/commissioner` },
    { label: '🏆 Playoffs', path: `/league/${activeLeague._id}/playoffs` },
    { label: '📰 News', path: '/news' },
  ] : []

  return (
    <nav className={`border-b px-4 py-3 ${
      theme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">

          {/* Logo */}
          <Link to="/dashboard" className="text-xl font-bold text-green-500 shrink-0">
            🏈 Fantasy
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1 overflow-x-auto mx-4">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs px-2 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Notification Bell */}
            <Link to="/notifications" className="relative p-2">
              <span className="text-lg">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Username */}
            <span className={`text-sm hidden md:block ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
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
              className={`lg:hidden p-2 rounded-lg ${
                theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className={`lg:hidden mt-3 pb-3 border-t pt-3 grid grid-cols-3 gap-2 ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`text-xs px-3 py-2 rounded-lg transition-colors text-center ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
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
