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

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-2">
          Welcome, {user?.username}! 👋
        </h2>
        <p className="text-gray-400 mb-10">
          Team: <span className="text-green-400 font-semibold">
            {user?.teamName || 'No team name set'}
          </span>
        </p>

        {/* My Leagues */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">My Leagues</h3>
            <div className="flex gap-3">
              <Link
                to="/league/join"
                className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Join League
              </Link>
              <Link
                to="/league/create"
                className="bg-green-500 hover:bg-green-400 text-white text-sm px-4 py-2 rounded-lg transition-colors"
              >
                + Create League
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leagues.map((league) => (
                <Link
                  key={league._id}
                  to={`/league/${league._id}`}
                  className="bg-gray-800 border border-gray-700 hover:border-green-500 rounded-2xl p-6 transition-colors"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: '🎯 Draft Room', desc: 'Join your league draft', path: '/draft' },
            { title: '🔄 Trade Center', desc: 'Send and receive trades', path: '/trades' },
            { title: '📥 Waiver Wire', desc: 'Pick up free agents', path: '/waivers' },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-green-500 transition-colors cursor-pointer"
            >
              <h4 className="text-lg font-bold mb-1">{card.title}</h4>
              <p className="text-gray-400 text-sm">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
