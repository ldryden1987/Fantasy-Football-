import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getTrades, sendTrade, acceptTrade, rejectTrade, cancelTrade } from '../services/tradeService'
import { getLeague } from '../services/leagueService'
import api from '../services/api'
import Navbar from '../components/Navbar'

const positionColors = {
  QB: 'bg-red-500/20 text-red-400',
  RB: 'bg-blue-500/20 text-blue-400',
  WR: 'bg-green-500/20 text-green-400',
  TE: 'bg-yellow-500/20 text-yellow-400',
  K: 'bg-purple-500/20 text-purple-400',
  DEF: 'bg-gray-500/20 text-gray-400',
}

const Trades = () => {
  const { id } = useParams()
  const [trades, setTrades] = useState([])
  const [myTeamId, setMyTeamId] = useState(null)
  const [myRoster, setMyRoster] = useState([])
  const [league, setLeague] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState('')
  const [theirRoster, setTheirRoster] = useState([])
  const [senderPlayers, setSenderPlayers] = useState([])
  const [receiverPlayers, setReceiverPlayers] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
  }, [id])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [tradesRes, leagueRes] = await Promise.all([
        getTrades(id),
        getLeague(id)
      ])
      setTrades(tradesRes.data.trades)
      setMyTeamId(tradesRes.data.myTeamId)
      setLeague(leagueRes.data)

      // Get my roster
      const myTeam = leagueRes.data.teams.find(
        t => t._id === tradesRes.data.myTeamId ||
        t._id.toString() === tradesRes.data.myTeamId?.toString()
      )
      setMyRoster(myTeam?.roster || [])
    } catch (err) {
      console.error('Error fetching trades:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTeamSelect = async (teamId) => {
    setSelectedTeam(teamId)
    setReceiverPlayers([])
    const team = league.teams.find(t => t._id === teamId)
    setTheirRoster(team?.roster || [])
  }

  const togglePlayer = (playerId, list, setList) => {
    setList(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    )
  }

  const handleSendTrade = async () => {
    if (!selectedTeam || senderPlayers.length === 0 || receiverPlayers.length === 0) return
    try {
      await sendTrade(id, {
        receiverTeamId: selectedTeam,
        senderPlayers,
        receiverPlayers,
        message
      })
      setShowForm(false)
      setSenderPlayers([])
      setReceiverPlayers([])
      setMessage('')
      setSelectedTeam('')
      fetchAll()
    } catch (err) {
      console.error('Error sending trade:', err)
    }
  }

  const handleAccept = async (tradeId) => {
    try {
      await acceptTrade(tradeId)
      fetchAll()
    } catch (err) {
      console.error('Error accepting trade:', err)
    }
  }

  const handleReject = async (tradeId) => {
    try {
      await rejectTrade(tradeId)
      fetchAll()
    } catch (err) {
      console.error('Error rejecting trade:', err)
    }
  }

  const handleCancel = async (tradeId) => {
    try {
      await cancelTrade(tradeId)
      fetchAll()
    } catch (err) {
      console.error('Error cancelling trade:', err)
    }
  }

  const otherTeams = league?.teams?.filter(
    t => t._id !== myTeamId && t._id?.toString() !== myTeamId?.toString()
  ) || []

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">🔄 Trade Center</h2>
            <p className="text-gray-400 mt-1">Send and manage trade offers</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            {showForm ? '✕ Cancel' : '+ New Trade'}
          </button>
        </div>

        {/* Trade Form */}
        {showForm && (
          <div className="bg-gray-800 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold mb-4">Create Trade Offer</h3>

            {/* Select Team */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Trade With</label>
              <select
                value={selectedTeam}
                onChange={(e) => handleTeamSelect(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="">Select a team...</option>
                {otherTeams.map(team => (
                  <option key={team._id} value={team._id}>{team.name}</option>
                ))}
              </select>
            </div>

            {selectedTeam && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* My Players */}
                <div>
                  <p className="text-gray-400 text-sm mb-2">Your Players to Send</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {myRoster.map(({ player }) => player && (
                      <div
                        key={player._id}
                        onClick={() => togglePlayer(player._id, senderPlayers, setSenderPlayers)}
                        className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors ${
                          senderPlayers.includes(player._id)
                            ? 'bg-green-500/20 border border-green-500'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        <span className="font-semibold text-sm">{player.name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${positionColors[player.position]}`}>
                          {player.position}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Their Players */}
                <div>
                  <p className="text-gray-400 text-sm mb-2">Their Players to Receive</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {theirRoster.map(({ player }) => player && (
                      <div
                        key={player._id}
                        onClick={() => togglePlayer(player._id, receiverPlayers, setReceiverPlayers)}
                        className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors ${
                          receiverPlayers.includes(player._id)
                            ? 'bg-green-500/20 border border-green-500'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        <span className="font-semibold text-sm">{player.name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${positionColors[player.position]}`}>
                          {player.position}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Message */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Message (optional)</label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message to your trade offer..."
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <button
              onClick={handleSendTrade}
              disabled={!selectedTeam || senderPlayers.length === 0 || receiverPlayers.length === 0}
              className="w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
            >
              Send Trade Offer
            </button>
          </div>
        )}

        {/* Trade List */}
        {loading ? (
          <p className="text-gray-400">Loading trades...</p>
        ) : trades.length === 0 ? (
          <div className="bg-gray-800 border border-dashed border-gray-700 rounded-2xl p-12 text-center">
            <p className="text-gray-400">No trades yet. Send your first offer!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trades.map((trade) => {
              const isSender = trade.senderTeam._id === myTeamId ||
                trade.senderTeam._id?.toString() === myTeamId?.toString()

              return (
                <div key={trade._id} className="bg-gray-800 rounded-2xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold">
                        {isSender ? `You → ${trade.receiverTeam.name}` : `${trade.senderTeam.name} → You`}
                      </p>
                      {trade.message && (
                        <p className="text-gray-400 text-sm mt-1">"{trade.message}"</p>
                      )}
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      trade.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      trade.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                      trade.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-600 text-gray-400'
                    }`}>
                      {trade.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-xs mb-2">
                        {isSender ? 'You send' : `${trade.senderTeam.name} sends`}
                      </p>
                      {trade.senderPlayers.map(p => (
                        <div key={p._id} className="flex justify-between items-center py-1">
                          <span className="text-sm">{p.name}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${positionColors[p.position]}`}>
                            {p.position}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-2">
                        {isSender ? `${trade.receiverTeam.name} sends` : 'You send'}
                      </p>
                      {trade.receiverPlayers.map(p => (
                        <div key={p._id} className="flex justify-between items-center py-1">
                          <span className="text-sm">{p.name}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${positionColors[p.position]}`}>
                            {p.position}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {trade.status === 'pending' && (
                    <div className="flex gap-3">
                      {!isSender && (
                        <button
                          onClick={() => handleAccept(trade._id)}
                          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          ✅ Accept
                        </button>
                      )}
                      {!isSender && (
                        <button
                          onClick={() => handleReject(trade._id)}
                          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          ❌ Reject
                        </button>
                      )}
                      {isSender && (
                        <button
                          onClick={() => handleCancel(trade._id)}
                          className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          🚫 Cancel
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Trades
