import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-400">🏈 Fantasy Football</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">
            {user?.teamName || user?.username}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-2">
          Welcome, {user?.username}! 👋
        </h2>
        <p className="text-gray-400 mb-10">
          Team: <span className="text-green-400 font-semibold">{user?.teamName || 'No team name set'}</span>
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: '🏟️ My League', desc: 'View standings, matchups, and league settings', color: 'green' },
            { title: '📋 My Roster', desc: 'Manage your players and starting lineup', color: 'blue' },
            { title: '🎯 Draft Room', desc: 'Join your league draft and pick players', color: 'purple' },
            { title: '📊 Live Scoring', desc: 'Track live scores during game days', color: 'yellow' },
            { title: '🔄 Trade Center', desc: 'Send and receive trade offers', color: 'orange' },
            { title: '📥 Waiver Wire', desc: 'Pick up free agents and drop players', color: 'red' },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-green-500 transition-colors cursor-pointer"
            >
              <h3 className="text-xl font-bold mb-2">{card.title}</h3>
              <p className="text-gray-400 text-sm">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
