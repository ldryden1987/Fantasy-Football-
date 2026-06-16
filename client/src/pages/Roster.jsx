import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import { moveRosterSlot } from '../services/leagueService'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const SLOT_ORDER = ['QB', 'RB1', 'RB2', 'WR1', 'WR2', 'TE', 'FLEX', 'K', 'DEF', 'BN', 'BN', 'BN', 'BN', 'BN', 'BN', 'BN', 'IR']

const positionColors = {
  QB: 'bg-red-500/20 text-red-400',
  RB1: 'bg-blue-500/20 text-blue-400',
  RB2: 'bg-blue-500/20 text-blue-400',
  WR1: 'bg-green-500/20 text-green-400',
  WR2: 'bg-green-500/20 text-green-400',
  TE: 'bg-yellow-500/20 text-yellow-400',
  K: 'bg-purple-500/20 text-purple-400',
  DEF: 'bg-gray-500/20 text-gray-400',
  FLEX: 'bg-orange-500/20 text-orange-400',
  BN: 'bg-gray-600/20 text-gray-500',
  IR: 'bg-pink-500/20 text-pink-400',
}

const Roster = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoster()
  }, [id])

  const fetchRoster = async () => {
    try {
      const res = await api.get(`/leagues/${id}`)
      const myTeam = res.data.teams.find(t => t.owner._id === user._id)
      setTeam(myTeam)
    } catch (err) {
      console.error('Error fetching roster:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMove = async (playerId, newSlot) => {
    try {
      await moveRosterSlot(id, { playerId, newSlot })
      fetchRoster()
    } catch (err) {
      console.error('Error moving player:', err)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-white text-xl">Loading roster...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-2">{team?.name}</h2>
        <p className="text-gray-400 mb-8">Manage your roster</p>

        <div className="bg-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700 bg-gray-900">
                <th className="text-left py-3 px-4">Slot</th>
                <th className="text-left py-3 px-4">Player</th>
                <th className="text-left py-3 px-4">Position</th>
                <th className="text-left py-3 px-4">NFL Team</th>
                <th className="text-center py-3 px-4">Pts</th>
                <th className="text-center py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {team?.roster?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Your roster is empty. Players will appear here after the draft.
                  </td>
                </tr>
              ) : (
                (() => {
                  const usedIds = new Set()
                  return SLOT_ORDER.map((slot, idx) => {
                    const rosterSlot = team?.roster?.find(r =>
                      r.slot === slot && r.player && !usedIds.has(r.player._id)
                    )
                    if (rosterSlot) usedIds.add(rosterSlot.player._id)
                    return (
                      <tr key={`${slot}-${idx}`} className="border-b border-gray-700 hover:bg-gray-700/50">
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${positionColors[slot]}`}>
                            {slot}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          {rosterSlot?.player?.name || (
                            <span className="text-gray-500 italic">Empty</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {rosterSlot?.player?.position || '—'}
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {rosterSlot?.player?.nflTeam || '—'}
                        </td>
                        <td className="py-3 px-4 text-center text-green-400 font-bold">
                          {rosterSlot?.player?.fantasyPoints || 0}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {rosterSlot?.player && slot !== 'IR' && (
                            <button
                              onClick={() => handleMove(rosterSlot.player._id, 'IR')}
                              className="bg-pink-600/20 hover:bg-pink-600 text-pink-400 hover:text-white text-xs px-3 py-1 rounded-lg transition-colors"
                            >
                              Move to IR
                            </button>
                          )}
                          {rosterSlot?.player && slot === 'IR' && (
                            <button
                              onClick={() => handleMove(rosterSlot.player._id, 'BN')}
                              className="bg-gray-600/20 hover:bg-gray-600 text-gray-400 hover:text-white text-xs px-3 py-1 rounded-lg transition-colors"
                            >
                              Activate
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                })()
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Roster
