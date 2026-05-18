import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDraft } from '../context/DraftContext'
import { useLeague } from '../context/LeagueContext'
import { startDraft, getDraft } from '../services/draftService'
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

const DraftRoom = () => {
  const { id: leagueId } = useParams()
  const { user } = useAuth()
  const { activeLeague } = useLeague()
  const { draft, lastPick, timer, connected, connectToDraft, makePick } = useDraft()

  const [players, setPlayers] = useState([])
  const [filteredPlayers, setFilteredPlayers] = useState([])
  const [position, setPosition] = useState('All')
  const [search, setSearch] = useState('')
  const [myTeam, setMyTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        // Get players
        const playersRes = await getPlayers({ available: true })
        setPlayers(playersRes.data)
        setFilteredPlayers(playersRes.data)

        // Try to get existing draft
        try {
          const draftRes = await getDraft(leagueId)
          if (draftRes.data) {
            const team = draftRes.data.draftOrder.find(
              t => t.owner?._id === user._id || t.owner === user._id
            )
            setMyTeam(team)
            connectToDraft(leagueId, team?._id)
          }
        } catch {
          console.log('No draft started yet')
        }
      } catch (err) {
        console.error('Init error:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [leagueId])

  useEffect(() => {
    let result = players.filter(p => !p.owned)
    if (position !== 'All') result = result.filter(p => p.position === position)
    if (search) result = result.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    )
    setFilteredPlayers(result)
  }, [position, search, players, draft])

  const handleStartDraft = async () => {
    setStarting(true)
    try {
      await startDraft(leagueId)
      const draftRes = await getDraft(leagueId)
      const team = draftRes.data.draftOrder.find(
        t => t.owner?._id === user._id || t.owner === user._id
      )
      setMyTeam(team)
      connectToDraft(leagueId, team?._id)
    } catch (err) {
      console.error('Start draft error:', err)
    } finally {
      setStarting(false)
    }
  }

  const getCurrentTeam = () => {
    if (!draft) return null
    const totalTeams = draft.draftOrder.length
    const pickIndex = draft.currentPick % totalTeams
    const isEvenRound = draft.currentRound % 2 === 0
    const currentTeamIndex = isEvenRound ? totalTeams - 1 - pickIndex : pickIndex
    return draft.draftOrder[currentTeamIndex]
  }

  const isMyTurn = () => {
    const currentTeam = getCurrentTeam()
    return currentTeam?._id === myTeam?._id
  }

  const handlePick = (playerId) => {
    if (!isMyTurn()) return
    makePick(leagueId, myTeam._id, playerId)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-white text-xl">Loading draft room...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Draft Header */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">🎯 Draft Room</h2>
            <p className="text-gray-400 text-sm mt-1">
              {draft ? `Round ${draft.currentRound} • Pick ${draft.currentPick + 1}` : 'Draft not started'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection status */}
            <span className={`text-xs px-3 py-1 rounded-full ${connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {connected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>

            {/* Timer */}
            {draft?.status === 'active' && (
              <div className={`text-2xl font-mono font-bold px-4 py-2 rounded-lg ${
                timer <= 10 ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-white'
              }`}>
                {timer}s
              </div>
            )}

            {/* Start draft button */}
            {!draft && (
              <button
                onClick={handleStartDraft}
                disabled={starting}
                className="bg-green-500 hover:bg-green-400 disabled:bg-green-800 text-white font-bold px-6 py-3 rounded-lg transition-colors"
              >
                {starting ? 'Starting...' : '🚀 Start Draft'}
              </button>
            )}

            {draft?.status === 'completed' && (
              <span className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg font-semibold">
                ✅ Draft Complete!
              </span>
            )}
          </div>
        </div>

        {draft && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left — Current Pick & On The Clock */}
            <div className="lg:col-span-1 space-y-4">

              {/* On The Clock */}
              <div className="bg-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">⏱️ On The Clock</h3>
                {draft.status === 'active' ? (
                  <div className={`p-4 rounded-xl text-center ${
                    isMyTurn() ? 'bg-green-500/20 border border-green-500' : 'bg-gray-700'
                  }`}>
                    <p className="text-2xl font-bold">
                      {getCurrentTeam()?.name || 'Loading...'}
                    </p>
                    {isMyTurn() && (
                      <p className="text-green-400 font-semibold mt-1">
                        🎯 It's your turn!
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400">
                    {draft.status === 'completed' ? '✅ Draft complete!' : 'Waiting to start...'}
                  </p>
                )}
              </div>

              {/* Recent Picks */}
              <div className="bg-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">📋 Recent Picks</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {draft.picks.length === 0 ? (
                    <p className="text-gray-400 text-sm">No picks yet</p>
                  ) : (
                    [...draft.picks].reverse().slice(0, 20).map((pick, i) => (
                      <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-gray-700">
                        <div>
                          <span className="text-gray-400">R{pick.round}.{pick.pick} </span>
                          <span className="font-semibold">{pick.player?.name}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${positionColors[pick.player?.position]}`}>
                          {pick.player?.position}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right — Available Players */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">🏈 Available Players</h3>

                {/* Search & Filter */}
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

                {/* Players List */}
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
                      {filteredPlayers.map((player) => (
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
                              onClick={() => handlePick(player._id)}
                              disabled={!isMyTurn() || draft.status !== 'active'}
                              className="bg-green-500 hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs px-3 py-1 rounded-lg transition-colors font-semibold"
                            >
                              Draft
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DraftRoom
