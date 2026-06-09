import { useEffect, useState } from 'react'
import { getPlayers } from '../services/playerService'
import Navbar from '../components/Navbar'

const POSITIONS = ['All', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF']

const positionColors = {
  QB: 'bg-red-500/20 text-red-400',
  RB: 'bg-blue-500/20 text-blue-400',
  WR: 'bg-green-500/20 text-green-400',
  TE: 'bg-yellow-500/20 text-yellow-400',
  K: 'bg-purple-500/20 text-purple-400',
  DEF: 'bg-gray-500/20 text-gray-400',
}

const Players = () => {
  const [players, setPlayers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [position, setPosition] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getPlayers()
        setPlayers(res.data)
        setFiltered(res.data)
      } catch (err) {
        console.error('Error fetching players:', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  useEffect(() => {
    let result = players
    if (position !== 'All') result = result.filter(p => p.position === position)
    if (search) result = result.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.nflTeam.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(result)
  }, [position, search, players])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">🏈 Player Browser</h2>
          <p className="text-gray-400 mt-1">Browse all available NFL players</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 mb-6">
          <input
            type="text"
            placeholder="Search players or teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-400 text-sm"
          />
          <div className="flex gap-2 flex-wrap">
            {POSITIONS.map(pos => (
              <button
                key={pos}
                onClick={() => setPosition(pos)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  position === pos
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* Player Count */}
        <p className="text-gray-400 text-sm mb-4">
          Showing {filtered.length} players
        </p>

        {/* Players Table */}
        {loading ? (
          <p className="text-gray-400">Loading players...</p>
        ) : (
          <div className="bg-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700 bg-gray-900">
                    <th className="text-left py-3 px-4">Player</th>
                    <th className="text-left py-3 px-4">Pos</th>
                    <th className="text-left py-3 px-4 hidden md:table-cell">NFL Team</th>
                    <th className="text-left py-3 px-4 hidden md:table-cell">Status</th>
                    <th className="text-left py-3 px-4 hidden lg:table-cell">Age</th>
                    <th className="text-center py-3 px-4">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((player) => (
                    <tr
                      key={player._id}
                      className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold">{player.name}</p>
                          <p className="text-gray-400 text-xs md:hidden">{player.nflTeam}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${positionColors[player.position]}`}>
                          {player.position}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 hidden md:table-cell">
                        {player.nflTeam}
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        {player.injuryStatus ? (
                          <span className={`text-xs font-semibold ${
                            player.injuryStatus === 'Out' ? 'text-red-400' :
                            player.injuryStatus === 'Doubtful' ? 'text-orange-400' :
                            player.injuryStatus === 'Questionable' ? 'text-yellow-400' :
                            'text-gray-400'
                          }`}>
                            {player.injuryStatus}
                          </span>
                        ) : (
                          <span className="text-green-400 text-xs font-semibold">Active</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-400 hidden lg:table-cell">
                        {player.age || '—'}
                      </td>
                      <td className="py-3 px-4 text-center text-green-400 font-bold">
                        {player.fantasyPoints}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Players
