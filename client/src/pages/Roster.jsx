import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const SLOT_ORDER = ['QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'DEF', 'BN']

const positionColors = {
  QB: 'bg-red-500/20 text-red-400',
  RB: 'bg-blue-500/20 text-blue-400',
  WR: 'bg-green-500/20 text-green-400',
  TE: 'bg-yellow-500/20 text-yellow-400',
  K: 'bg-purple-500/20 text-purple-400',
  DEF: 'bg-gray-500/20 text-gray-400',
  FLEX: 'bg-orange-500/20 text-orange-400',
  BN: 'bg-gray-600/20 text-gray-500',
}

const Roster = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
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
    fetch()
  }, [id])

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
              </tr>
            </thead>
            <tbody>
              {team?.roster?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    Your roster is empty. Players will appear here after the draft.
                  </td>
                </tr>
              ) : (
                SLOT_ORDER.map((slot) => {
                  const rosterSlot = team?.roster?.find(r => r.slot === slot)
                  return (
                    <tr key={slot} className="border-b border-gray-700 hover:bg-gray-700/50">
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
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Roster
