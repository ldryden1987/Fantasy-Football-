import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  getDashboard,
  updateSettings,
  vetoTrade,
  resetWaivers,
  removeTeam
} from '../services/commissionerService'
import { generatePlayoffs } from '../services/playoffService'
import Navbar from '../components/Navbar'

const CommissionerDashboard = () => {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    name: '',
    scoringType: 'ppr',
    playoffWeekStart: 14,
    playoffTeams: 4
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchDashboard()
  }, [id])

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const res = await getDashboard(id)
      setData(res.data)
      setSettings({
        name: res.data.league.name,
        scoringType: res.data.league.settings.scoringType,
        playoffWeekStart: res.data.league.settings.playoffWeekStart || 14,
        playoffTeams: res.data.league.settings.playoffTeams || 4
      })
    } catch (err) {
      console.error('Error fetching dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      await updateSettings(id, settings)
      setMessage('✅ Settings saved!')
      fetchDashboard()
    } catch (err) {
      setMessage('❌ Failed to save settings')
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleVeto = async (tradeId) => {
    try {
      await vetoTrade(tradeId)
      setMessage('✅ Trade vetoed!')
      fetchDashboard()
    } catch (err) {
      setMessage('❌ Failed to veto trade')
    } finally {
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleResetWaivers = async () => {
    try {
      await resetWaivers(id)
      setMessage('✅ Waiver order reset!')
    } catch (err) {
      setMessage('❌ Failed to reset waivers')
    } finally {
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleGeneratePlayoffs = async () => {
    try {
      const res = await generatePlayoffs(id)
      setMessage(`✅ Playoffs generated! Top ${res.data.playoffTeams?.length} teams seeded.`)
      fetchDashboard()
    } catch (err) {
      setMessage('❌ Failed to generate playoffs')
    } finally {
      setTimeout(() => setMessage(''), 4000)
    }
  }

  const handleRemoveTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to remove this team?')) return
    try {
      await removeTeam(id, teamId)
      setMessage('✅ Team removed!')
      fetchDashboard()
    } catch (err) {
      setMessage('❌ Failed to remove team')
    } finally {
      setTimeout(() => setMessage(''), 3000)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-white text-xl">Loading commissioner dashboard...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold">⚙️ Commissioner Dashboard</h2>
          <p className="text-gray-400 mt-1">Manage your league settings and members</p>
        </div>

        {/* Message */}
        {message && (
          <div className="bg-gray-800 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-6">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* League Settings */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">⚙️ League Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">League Name</label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-green-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Scoring Type</label>
                <select
                  value={settings.scoringType}
                  onChange={(e) => setSettings({ ...settings, scoringType: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-green-400 text-sm"
                >
                  <option value="ppr">PPR</option>
                  <option value="half-ppr">Half PPR</option>
                  <option value="standard">Standard</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Playoff Start Week</label>
                <select
                  value={settings.playoffWeekStart}
                  onChange={(e) => setSettings({ ...settings, playoffWeekStart: Number(e.target.value) })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-green-400 text-sm"
                >
                  {[13, 14, 15, 16].map(w => (
                    <option key={w} value={w}>Week {w}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Playoff Teams</label>
                <select
                  value={settings.playoffTeams}
                  onChange={(e) => setSettings({ ...settings, playoffTeams: Number(e.target.value) })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-green-400 text-sm"
                >
                  {[2, 4, 6, 8].map(n => (
                    <option key={n} value={n}>{n} Teams</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-800 text-white font-bold py-2 rounded-lg transition-colors text-sm"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">🚀 Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleGeneratePlayoffs}
                  className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
                >
                  🏆 Generate Playoffs
                </button>
                <button
                  onClick={handleResetWaivers}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
                >
                  🔄 Reset Waiver Order
                </button>
              </div>
            </div>

            {/* League Stats */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">📊 League Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">
                    {data?.league?.teams?.length}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">Teams</p>
                </div>
                <div className="bg-gray-700 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-400">
                    {data?.pendingTrades?.length}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">Pending Trades</p>
                </div>
                <div className="bg-gray-700 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-400 capitalize">
                    {data?.league?.status}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">Status</p>
                </div>
                <div className="bg-gray-700 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-purple-400">
                    {data?.league?.settings?.scoringType?.toUpperCase()}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">Scoring</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Trades */}
        {data?.pendingTrades?.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-6 mt-6">
            <h3 className="text-lg font-bold mb-4">🔄 Pending Trades</h3>
            <div className="space-y-4">
              {data.pendingTrades.map(trade => (
                <div key={trade._id} className="bg-gray-700 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">
                      {trade.senderTeam.name} ↔ {trade.receiverTeam.name}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {trade.senderPlayers.map(p => p.name).join(', ')} for {trade.receiverPlayers.map(p => p.name).join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleVeto(trade._id)}
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    🚫 Veto
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Teams Management */}
        <div className="bg-gray-800 rounded-2xl p-6 mt-6">
          <h3 className="text-lg font-bold mb-4">👥 Teams</h3>
          <div className="space-y-3">
            {data?.league?.teams?.map(team => (
              <div key={team._id} className="flex justify-between items-center bg-gray-700 rounded-xl p-4">
                <div>
                  <p className="font-semibold">{team.name}</p>
                  <p className="text-gray-400 text-sm">{team.owner?.username} · {team.owner?.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">
                    {team.wins}W - {team.losses}L
                  </span>
                  {team.owner?._id !== data?.league?.commissioner?._id && (
                    <button
                      onClick={() => handleRemoveTeam(team._id)}
                      className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommissionerDashboard
