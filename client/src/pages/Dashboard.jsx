import { useAuth } from '../context/AuthContext'
import { useLeague } from '../context/LeagueContext'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const Dashboard = () => {
  const { user } = useAuth()
  const { leagues, loading } = useLeague()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Welcome Header */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">
            Welcome, {user?.username}! 👋
          </h2>
          <p className="text-gray-400 mt-1">
            Team: <span className="text-green-400 font-semibold">
              {user?.teamName || 'No team name set'}
            </span>
          </p>
        </div>

        {/* My Leagues */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">My Leagues</h3>
            <div className="flex gap-2">
              <Link
                to="/league/join"
                className="bg-gray-700 hover:bg-gray-600 text-white text-xs md:text-sm px-3 md:px-4 py-2 rounded-lg transition-colors"
              >
                Join
              </Link>
              <Link
                to="/league/create"
                className="bg-green-500 hover:bg-green-400 text-white text-xs md:text-sm px-3 md:px-4 py-2 rounded-lg transition-colors"
              >
                + Create
              </Link>
            </div>
          </div>

          {loading ? (
            <p className="text-gray-400">Loading leagues...</p>
          ) : leagues.length === 0 ? (
            <div className="bg-gray-800 border border-gray-700 border-dashed rounded-2xl p-10 text-center">
              <p className="text-gray-400 mb-4">You're not in any leagues yet.</p>
              <Link
                to="/league/create"
                className="bg-green-500 hover:bg-green-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Create Your First League
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {leagues.map((league) => (
                <Link
                  key={league._id}
                  to={`/league/${league._id}`}
                  className="bg-gray-800 border border-gray-700 hover:border-green-500 rounded-2xl p-5 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-bold">{league.name}</h4>
                      <p className="text-gray-400 text-sm mt-1">
                        {league.members.length} / {league.settings.maxTeams} teams
                      </p>
                      <p className="text-gray-400 text-sm">
                        {league.settings.scoringType.toUpperCase()} scoring
                      </p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      league.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      league.status === 'drafting' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {league.status}
                    </span>
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    Invite Code: <span className="text-green-400 font-mono font-bold">
                      {league.inviteCode}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {[
            { title: '📰 Player News', desc: 'Injury reports and trending', path: '/news' },
            { title: '🎯 Draft Room', desc: 'Join your league draft', path: '#' },
            { title: '🔄 Trade Center', desc: 'Send and receive trades', path: '#' },
            { title: '📥 Waiver Wire', desc: 'Pick up free agents', path: '#' },
            { title: '📊 Standings', desc: 'View league standings', path: '#' },
            { title: '🤖 AI Analyzer', desc: 'AI-powered trade analysis', path: '#' },
          ].map((card) => (
            <Link
              key={card.title}
              to={card.path}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-4 md:p-6 hover:border-green-500 transition-colors"
            >
              <h4 className="text-sm md:text-lg font-bold mb-1">{card.title}</h4>
              <p className="text-gray-400 text-xs md:text-sm hidden sm:block">{card.desc}</p>
            </Link>
          ))}
        </div>

        {/* Stats Row */}
        {leagues.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Leagues', value: leagues.length, color: 'text-green-400' },
              { label: 'Active', value: leagues.filter(l => l.status === 'active').length, color: 'text-blue-400' },
              { label: 'Drafting', value: leagues.filter(l => l.status === 'drafting').length, color: 'text-yellow-400' },
              { label: 'Forming', value: leagues.filter(l => l.status === 'forming').length, color: 'text-purple-400' },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-800 rounded-2xl p-4 text-center">
                <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
