import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getStandings } from '../services/matchupService'
import Navbar from '../components/Navbar'

const Standings = () => {
  const { id } = useParams()
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getStandings(id)
        setStandings(res.data)
      } catch (err) {
        console.error('Error fetching standings:', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">📊 Standings</h2>
            <p className="text-gray-400 mt-1">League standings and records</p>
          </div>
          <Link
            to={`/league/${id}/scoring`}
            className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            📺 Live Scoring
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading standings...</p>
        ) : (
          <div className="bg-gray-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700 bg-gray-900">
                  <th className="text-left py-4 px-6">Rank</th>
                  <th className="text-left py-4 px-6">Team</th>
                  <th className="text-left py-4 px-6">Owner</th>
                  <th className="text-center py-4 px-6">W</th>
                  <th className="text-center py-4 px-6">L</th>
                  <th className="text-center py-4 px-6">PCT</th>
                  <th className="text-center py-4 px-6">PTS</th>
                </tr>
              </thead>
              <tbody>
                {standings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      No standings yet. Complete a week to see results.
                    </td>
                  </tr>
                ) : (
                  standings.map((team, i) => (
                    <tr
                      key={team._id}
                      className={`border-b border-gray-700 hover:bg-gray-700/50 transition-colors ${
                        i === 0 ? 'bg-green-500/5' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <span className={`font-bold text-lg ${
                          i === 0 ? 'text-yellow-400' :
                          i === 1 ? 'text-gray-300' :
                          i === 2 ? 'text-orange-400' :
                          'text-gray-500'
                        }`}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold">{team.name}</td>
                      <td className="py-4 px-6 text-gray-400">{team.owner}</td>
                      <td className="py-4 px-6 text-center text-green-400 font-bold">{team.wins}</td>
                      <td className="py-4 px-6 text-center text-red-400 font-bold">{team.losses}</td>
                      <td className="py-4 px-6 text-center text-gray-300">{team.winPct}</td>
                      <td className="py-4 px-6 text-center text-white font-bold">{team.points}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Standings
