import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDraft } from '../context/DraftContext'
import { useLeague } from '../context/LeagueContext'
import { useTheme } from '../context/ThemeContext'
import { startDraft, getDraft } from '../services/draftService'
import { getPlayers } from '../services/playerService'
import Navbar from '../components/Navbar'
import TeamAvatar from '../components/TeamAvatar'

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
  const { theme } = useTheme()
  const { draft, lastPick, timer, connected, connectToDraft, makePick } = useDraft()

  const [players, setPlayers] = useState([])
  const [filteredPlayers, setFilteredPlayers] = useState([])
  const [position, setPosition] = useState('All')
  const [search, setSearch] = useState('')
  const [myTeam, setMyTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [lastPickAnim, setLastPickAnim] = useState(null)

  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'
  const inputBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
  const textMuted = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'

  useEffect(() => {
    const init = async () => {
      try {
        const playersRes = await getPlayers({ available: true, sortBy: 'adp' })
        setPlayers(playersRes.data)
        setFilteredPlayers(playersRes.data)

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
    if (lastPick) {
      setLastPickAnim(lastPick)
      setTimeout(() => setLastPickAnim(null), 2000)
    }
  }, [lastPick])

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
      <div className="text-center">
        <div className="text-6xl animate-bounce-slow mb-4">🏈</div>
        <p className="text-white text-xl">Loading draft room...</p>
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar />

      {lastPickAnim && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="animate-pickMade bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl text-center">
            <p className="text-2xl font-black">🎯 PICKED!</p>
            <p className="text-lg font-bold">{lastPickAnim.player?.name}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">

        <div className={`${cardBg} rounded-2xl p-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
          <div>
            <h2 className="text-2xl font-bold">🎯 Draft Room</h2>
            <p className={`${textMuted} text-sm mt-1`}>
              {draft
                ? `Round ${draft.currentRound} of ${draft.totalRounds} • Pick ${draft.currentPick + 1}`
                : 'Draft not started yet'
              }
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-xs px-3 py-1 rounded-full ${
              connected
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {connected ? '🟢 Live' : '🔴 Offline'}
            </span>

            {draft?.status === 'active' && (
              <div className={`text-2xl font-mono font-bold px-4 py-2 rounded-xl ${
                timer <= 10
                  ? 'bg-red-500/20 text-red-400 animate-pulse'
                  : theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
              }`}>
                ⏱ {timer}s
              </div>
            )}

            {!draft && (
              <button
                onClick={handleStartDraft}
                disabled={starting}
                className="bg-green-500 hover:bg-green-400 disabled:bg-green-800 text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                {starting ? '⏳ Starting...' : '🚀 Start Draft'}
              </button>
            )}

            {draft?.status === 'completed' && (
              <span className="bg-green-500/20 text-green-400 px-4 py-2 rounded-xl font-semibold">
                🏆 Draft Complete!
              </span>
            )}
          </div>
        </div>

        {draft && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-1 space-y-4">

              <div className={`${cardBg} rounded-2xl p-5`}>
                <h3 className="font-bold mb-3">⏱️ On The Clock</h3>
                {draft.status === 'active' ? (
                  <div className={`p-4 rounded-xl text-center transition-all ${
                    isMyTurn()
                      ? 'bg-green-500/20 border-2 border-green-500 animate-fadeIn'
                      : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <TeamAvatar
                      team={getCurrentTeam()}
                      size="lg"
                      editable={false}
                    />
                    <p className="text-xl font-bold mt-2">
                      {getCurrentTeam()?.name || 'Loading...'}
                    </p>
                    {isMyTurn() && (
                      <p className="text-green-400 font-bold mt-1 animate-bounce-slow">
                        🎯 Your Pick!
                      </p>
                    )}
                  </div>
                ) : (
                  <p className={textMuted}>
                    {draft.status === 'completed' ? '✅ Draft complete!' : 'Waiting...'}
                  </p>
                )}
              </div>

              {draft.draftOrder?.length > 0 && (
                <div className={`${cardBg} rounded-2xl p-5`}>
                  <h3 className="font-bold mb-3">📋 Draft Order</h3>
                  <div className="space-y-2">
                    {draft.draftOrder.map((team, i) => {
                      const currentTeam = getCurrentTeam()
                      const isCurrent = currentTeam?._id === team._id
                      return (
                        <div
                          key={team._id}
                          className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                            isCurrent
                              ? 'bg-green-500/20 border border-green-500'
                              : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                        >
                          <span className={`text-sm font-bold w-6 ${textMuted}`}>
                            {i + 1}
                          </span>
                          <TeamAvatar team={team} size="sm" editable={false} />
                          <span className="text-sm font-semibold">{team.name}</span>
                          {isCurrent && (
                            <span className="ml-auto text-green-400 text-xs font-bold">
                              NOW
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className={`${cardBg} rounded-2xl p-5`}>
                <h3 className="font-bold mb-3">🏈 Recent Picks</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {draft.picks.length === 0 ? (
                    <p className={`${textMuted} text-sm`}>No picks yet</p>
                  ) : (
                    [...draft.picks].reverse().slice(0, 15).map((pick, i) => (
                      <div
                        key={i}
                        className={`flex justify-between items-center text-xs py-2 border-b ${
                          theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
                        } animate-fadeIn`}
                      >
                        <div>
                          <span className={`${textMuted} mr-1`}>
                            R{pick.round}.{pick.pick}
                          </span>
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

            <div className="lg:col-span-2">
              <div className={`${cardBg} rounded-2xl p-5`}>
                <h3 className="font-bold mb-4">🏈 Available Players</h3>

                <div className="flex flex-col gap-3 mb-4">
                  <input
                    type="text"
                    placeholder="Search players..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`${inputBg} ${theme === 'dark' ? 'text-white' : 'text-gray-900'} rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-green-400 text-sm`}
                  />
                  <div className="flex gap-2 flex-wrap">
                    {POSITIONS.map(pos => (
                      <button
                        key={pos}
                        onClick={() => setPosition(pos)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105 ${
                          position === pos
                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                            : theme === 'dark'
                              ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                <p className={`${textMuted} text-xs mb-3`}>
                  {filteredPlayers.length} available
                </p>

                <div className="overflow-y-auto max-h-[500px]">
                  <table className="w-full text-sm">
                    <thead className={`sticky top-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                      <tr className={`${textMuted} border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <th className="text-left py-2 px-3">Player</th>
                        <th className="text-left py-2 px-3">Pos</th>
                        <th className="text-left py-2 px-3 hidden md:table-cell">Team</th>
                        <th className="text-left py-2 px-3 hidden md:table-cell">ADP</th>
                        <th className="text-center py-2 px-3">Pick</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPlayers.map((player) => (
                        <tr
                          key={player._id}
                          className={`border-b transition-colors ${
                            theme === 'dark'
                              ? 'border-gray-700 hover:bg-gray-700/50'
                              : 'border-gray-100 hover:bg-gray-50'
                          }`}
                        >
                          <td className="py-2 px-3">
                            <div>
                              <p className="font-semibold">{player.name}</p>
                              {player.injuryStatus && (
                                <p className="text-red-400 text-xs">{player.injuryStatus}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${positionColors[player.position]}`}>
                              {player.position}
                            </span>
                          </td>
                          <td className={`py-2 px-3 ${textMuted} hidden md:table-cell`}>
                            {player.nflTeam}
                          </td>
                          <td className={`py-2 px-3 ${textMuted} hidden md:table-cell`}>
                            {player.adp ? `#${player.adp}` : '—'}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              onClick={() => handlePick(player._id)}
                              disabled={!isMyTurn() || draft.status !== 'active'}
                              className={`text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                                isMyTurn() && draft.status === 'active'
                                  ? 'bg-green-500 hover:bg-green-400 hover:scale-105 active:scale-95 shadow-lg shadow-green-500/20'
                                  : 'bg-gray-600 cursor-not-allowed opacity-50'
                              }`}
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

