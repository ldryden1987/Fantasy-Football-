import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getLeague } from '../services/leagueService'
import Navbar from '../components/Navbar'

const LeagueHome = () => {
  const { id } = useParams()
  const [league, setLeague] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getLeague(id)
        setLeague(res.data)
      } catch (err) {
        console.error('Error fetching league:', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-white text-xl">Loading league...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* League Header */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold">{league?.name}</h2>
              <p className="text-gray-400 mt-1">
                Commissioner: <span className="text-green-400">{league?.commissioner?.username}</span>
              </p>
              <div className="flex gap-4 mt-3">
                <span className="text-sm text-gray-400">
                  {league?.settings?.scoringType?.toUpperCase()} Scoring
                </span>
                <span className="text-sm text-gray-400">
                  {league?.members?.length}/{league?.settings?.maxTeams} Teams
                </span>
                <span className="text-sm text-gray-400 capitalize">
                  {league?.settings?.draftType} Draft
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Invite Code</p>
              <p className="text-green-400 font-mono font-bold text-2xl">
                {league?.inviteCode}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {[
             { title: '📋 My Roster', desc: 'Manage your players', path: `/league/${id}/roster` },
             { title: '🏈 Player Browser', desc: 'Browse all NFL players', path: `/league/${id}/players` },
             { title: '🎯 Draft Room', desc: 'Join your league draft', path: `/league/${id}/draft` },
             { title: '📺 Live Scoring', desc: 'View weekly matchups', path: `/league/${id}/scoring` },
             { title: '📊 Standings', desc: 'League standings', path: `/league/${id}/standings` },
             { title: '🔄 Trade Center', desc: 'Send and receive trades', path: `/league/${id}/trades` },
             { title: '📥 Waiver Wire', desc: 'Pick up free agents', path: `/league/${id}/waivers` },
             { title: '🤖 Trade Analyzer', desc: 'AI-powered trade analysis', path: `/league/${id}/trade-analyzer` },
             { title: '⚙️ Commissioner', desc: 'Manage league settings', path: `/league/${id}/commissioner` },
             { title: '🏆 Playoffs', desc: 'Playoff bracket', path: `/league/${id}/playoffs` },

            ].map((card) => (
            <Link
              key={card.title}
              to={card.path}
              className="bg-gray-800 border border-gray-700 hover:border-green-500 rounded-2xl p-6 transition-colors"
            >
              <h4 className="text-lg font-bold mb-1">{card.title}</h4>
              <p className="text-gray-400 text-sm">{card.desc}</p>
            </Link>
          ))}
        </div>

        {/* Teams / Standings */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Teams</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="text-left py-3 px-4">Team</th>
                  <th className="text-left py-3 px-4">Owner</th>
                  <th className="text-center py-3 px-4">W</th>
                  <th className="text-center py-3 px-4">L</th>
                  <th className="text-center py-3 px-4">PTS</th>
                </tr>
              </thead>
              <tbody>
                {league?.teams?.map((team, i) => (
                  <tr key={team._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="py-3 px-4 font-semibold">
                      {i + 1}. {team.name}
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {team.owner?.username}
                    </td>
                    <td className="py-3 px-4 text-center text-green-400">{team.wins}</td>
                    <td className="py-3 px-4 text-center text-red-400">{team.losses}</td>
                    <td className="py-3 px-4 text-center">{team.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeagueHome
