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
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-2">Player Browser</h2>
        <p className="text-gray-400 mb-8">Browse all available NFL players</p>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search players or teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-400 flex-1"
          />
          <div className="flex gap-2 flex-wrap">
            {POSITIONS.map(pos => (
              <button
                key={pos}
                onClick={() => setPosition(pos)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
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
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700 bg-gray-900">
                  <th className="text-left py-3 px-4">Player</th>
                  <th className="text-left py-3 px-4">Position</th>
                  <th className="text-left py-3 px-4">NFL Team</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-center py-3 px-4">Fantasy Pts</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((player) => (
                  <tr
                    key={player._id}
                    className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold">{player.name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${positionColors[player.position]}`}>
                        {player.position}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{player.nflTeam}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold ${
                        player.status === 'active' ? 'text-green-400' :
                        player.status === 'injured' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {player.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-green-400 font-bold">
                      {player.fantasyPoints}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Players
