import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { claimPlayer, getWaivers } from '../services/waiverService'
import { getPlayers } from '../services/playerService'
import api from '../services/api'
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

const Waivers = () => {
  const { id } = useParams()
  const [availablePlayers, setAvailablePlayers] = useState([])
  const [myRoster, setMyRoster] = useState([])
  const [waiverClaims, setWaiverClaims] = useState([])
  const [position, setPosition] = useState('All')
  const [search, setSearch] = useState('')
  const [dropPlayer, setDropPlayer] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
  }, [id])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [playersRes, waiversRes, rosterRes] = await Promise.all([
        getPlayers({ available: true }),
        getWaivers(id),
        api.get(`/leagues/${id}`)
      ])

      setAvailablePlayers(playersRes.data)
      setWaiverClaims(waiversRes.data)

      const myTeam = rosterRes.data.teams.find(
        t => t.owner?._id === rosterRes.data.commissioner?._id
      )
      setMyRoster(myTeam?.roster || [])
    } catch (err) {
      console.error('Error fetching waiver data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async (playerId) => {
    try {
      await claimPlayer(id, {
        addPlayerId: playerId,
        dropPlayerId: dropPlayer || null
      })
      setDropPlayer('')
      fetchAll()
    } catch (err) {
      console.error('Error claiming player:', err)
    }
  }

  const filtered = availablePlayers.filter(p => {
    const matchPos = position === 'All' || p.position === position
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchPos && matchSearch
  })

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold">📥 Waiver Wire</h2>
          <p className="text-gray-400 mt-1">Pick up available free agents</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — Drop Player + Claims */}
          <div className="space-y-4">
            {/* Drop Player */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Drop Player (optional)</h3>
              <select
                value={dropPlayer}
                onChange={(e) => setDropPlayer(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-400 text-sm"
              >
                <option value="">No drop</option>
                {myRoster.map(({ player }) => player && (
                  <option key={player._id} value={player._id}>
                    {player.name} ({player.position})
                  </option>
                ))}
              </select>
            </div>

            {/* My Waiver Claims */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">My Claims</h3>
              {waiverClaims.length === 0 ? (
                <p className="text-gray-400 text-sm">No pending claims</p>
              ) : (
                <div className="space-y-3">
                  {waiverClaims.map((claim) => (
                    <div key={claim._id} className="bg-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">
                          + {claim.addPlayer?.name}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          claim.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          claim.status === 'processed' ? 'bg-green-500/20 text-green-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {claim.status}
                        </span>
                      </div>
                      {claim.dropPlayer && (
                        <p className="text-red-400 text-xs mt-1">
                          - {claim.dropPlayer?.name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — Available Players */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Available Players</h3>

              {/* Filters */}
              <div className="flex flex-col gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Search players..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-gray-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-green-400 text-sm"
                />
                <div className="flex gap-2 flex-wrap">
                  {POSITIONS.map(pos => (
                    <button
                      key={pos}
                      onClick={() => setPosition(pos)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        position === pos
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* Players Table */}
              {loading ? (
                <p className="text-gray-400">Loading players...</p>
              ) : (
                <div className="overflow-y-auto max-h-[500px]">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-800">
                      <tr className="text-gray-400 border-b border-gray-700">
                        <th className="text-left py-2 px-3">Player</th>
                        <th className="text-left py-2 px-3">Pos</th>
                        <th className="text-left py-2 px-3">Team</th>
                        <th className="text-center py-2 px-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((player) => (
                        <tr key={player._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                          <td className="py-2 px-3 font-semibold">{player.name}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${positionColors[player.position]}`}>
                              {player.position}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-gray-400">{player.nflTeam}</td>
                          <td className="py-2 px-3 text-center">
                            <button
                              onClick={() => handleClaim(player._id)}
                              className="bg-green-500 hover:bg-green-400 text-white text-xs px-3 py-1 rounded-lg transition-colors font-semibold"
                            >
                              Claim
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Waivers
