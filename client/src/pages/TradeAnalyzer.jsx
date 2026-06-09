import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { analyzeTrade } from '../services/aiService'
import { getLeague } from '../services/leagueService'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const positionColors = {
  QB: 'bg-red-500/20 text-red-400',
  RB: 'bg-blue-500/20 text-blue-400',
  WR: 'bg-green-500/20 text-green-400',
  TE: 'bg-yellow-500/20 text-yellow-400',
  K: 'bg-purple-500/20 text-purple-400',
  DEF: 'bg-gray-500/20 text-gray-400',
}

const gradeColors = {
  A: 'text-green-400',
  B: 'text-blue-400',
  C: 'text-yellow-400',
  D: 'text-orange-400',
  F: 'text-red-400',
}

const verdictColors = {
  Accept: 'bg-green-500/20 text-green-400 border-green-500',
  Reject: 'bg-red-500/20 text-red-400 border-red-500',
  Consider: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
}

const TradeAnalyzer = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [league, setLeague] = useState(null)
  const [myRoster, setMyRoster] = useState([])
  const [allTeams, setAllTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState('')
  const [theirRoster, setTheirRoster] = useState([])
  const [givingPlayers, setGivingPlayers] = useState([])
  const [receivingPlayers, setReceivingPlayers] = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const res = await getLeague(id)
        setLeague(res.data)
        const myTeam = res.data.teams.find(
          t => t.owner?._id === user._id ||
          t.owner?._id?.toString() === user._id?.toString()
        )
        setMyRoster(myTeam?.roster?.filter(r => r.player) || [])
        setAllTeams(res.data.teams.filter(
          t => t.owner?._id !== user._id &&
          t.owner?._id?.toString() !== user._id?.toString()
        ))
      } catch (err) {
        console.error('Error loading:', err)
      } finally {
        setFetching(false)
      }
    }
    init()
  }, [id])

  const handleTeamSelect = (teamId) => {
    setSelectedTeam(teamId)
    setReceivingPlayers([])
    const team = league.teams.find(t => t._id === teamId)
    setTheirRoster(team?.roster?.filter(r => r.player) || [])
  }

  const togglePlayer = (playerId, list, setList) => {
    setList(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    )
  }

  const handleAnalyze = async () => {
    if (givingPlayers.length === 0 || receivingPlayers.length === 0) return
    setLoading(true)
    setAnalysis(null)
    try {
      const res = await analyzeTrade({
        senderPlayerIds: givingPlayers,
        receiverPlayerIds: receivingPlayers,
        scoringType: league?.settings?.scoringType || 'ppr'
      })
      setAnalysis(res.data)
    } catch (err) {
      console.error('Error analyzing trade:', err)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-white text-xl">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold">🤖 AI Trade Analyzer</h2>
          <p className="text-gray-400 mt-1">
            Get instant AI-powered trade analysis
          </p>
        </div>

        {/* Trade Builder */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">Build Your Trade</h3>

          {/* Select Opponent */}
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">Trade With</label>
            <select
              value={selectedTeam}
              onChange={(e) => handleTeamSelect(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="">Select a team...</option>
              {allTeams.map(team => (
                <option key={team._id} value={team._id}>{team.name}</option>
              ))}
            </select>
          </div>

          {selectedTeam && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* My Players */}
              <div>
                <p className="text-gray-400 text-sm mb-3">
                  You Give Up
                  {givingPlayers.length > 0 && (
                    <span className="text-green-400 ml-2">({givingPlayers.length} selected)</span>
                  )}
                </p>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {myRoster.map(({ player }) => (
                    <div
                      key={player._id}
                      onClick={() => togglePlayer(player._id, givingPlayers, setGivingPlayers)}
                      className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors ${
                        givingPlayers.includes(player._id)
                          ? 'bg-red-500/20 border border-red-500'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-sm">{player.name}</p>
                        <p className="text-gray-400 text-xs">{player.nflTeam}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {player.injuryStatus && (
                          <span className="text-xs text-red-400">{player.injuryStatus}</span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${positionColors[player.position]}`}>
                          {player.position}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Their Players */}
              <div>
                <p className="text-gray-400 text-sm mb-3">
                  You Receive
                  {receivingPlayers.length > 0 && (
                    <span className="text-green-400 ml-2">({receivingPlayers.length} selected)</span>
                  )}
                </p>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {theirRoster.map(({ player }) => (
                    <div
                      key={player._id}
                      onClick={() => togglePlayer(player._id, receivingPlayers, setReceivingPlayers)}
                      className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors ${
                        receivingPlayers.includes(player._id)
                          ? 'bg-green-500/20 border border-green-500'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-sm">{player.name}</p>
                        <p className="text-gray-400 text-xs">{player.nflTeam}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {player.injuryStatus && (
                          <span className="text-xs text-red-400">{player.injuryStatus}</span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${positionColors[player.position]}`}>
                          {player.position}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={loading || givingPlayers.length === 0 || receivingPlayers.length === 0}
            className="w-full mt-6 bg-green-500 hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors text-lg"
          >
            {loading ? '🤖 Analyzing with AI...' : '🤖 Analyze Trade'}
          </button>
        </div>

        {/* Analysis Results */}
        {loading && (
          <div className="bg-gray-800 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-white text-xl font-bold">Analyzing your trade...</p>
            <p className="text-gray-400 mt-2">Claude is evaluating player values, injury risks, and more</p>
          </div>
        )}

        {analysis && !loading && (
          <div className="space-y-6">

            {/* Verdict */}
            <div className={`border rounded-2xl p-8 text-center ${verdictColors[analysis.analysis.verdict]}`}>
              <p className="text-5xl font-black mb-2">{analysis.analysis.verdict}</p>
              <p className="text-lg opacity-80">AI Recommendation</p>
            </div>

            {/* Grades */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-2xl p-6 text-center">
                <p className="text-gray-400 text-sm mb-2">You Give Up</p>
                <p className={`text-6xl font-black ${gradeColors[analysis.analysis.givingGrade]}`}>
                  {analysis.analysis.givingGrade}
                </p>
              </div>
              <div className="bg-gray-800 rounded-2xl p-6 text-center">
                <p className="text-gray-400 text-sm mb-2">You Receive</p>
                <p className={`text-6xl font-black ${gradeColors[analysis.analysis.receivingGrade]}`}>
                  {analysis.analysis.receivingGrade}
                </p>
              </div>
            </div>

            {/* Player Analysis */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Player Breakdown</h3>
              <div className="space-y-4">
                {analysis.analysis.playerAnalysis?.map((p, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <span className={`px-2 py-1 rounded text-xs font-bold shrink-0 ${
                      p.side === 'giving' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {p.side === 'giving' ? 'OUT' : 'IN'}
                    </span>
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-gray-400 text-sm">{p.analysis}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Factors */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Key Factors</h3>
              <ul className="space-y-2">
                {analysis.analysis.keyFactors?.map((factor, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span className="text-gray-300 text-sm">{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Final Recommendation */}
            <div className="bg-gray-800 border border-green-500/30 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-3 text-green-400">🤖 Final Recommendation</h3>
              <p className="text-gray-300 leading-relaxed">
                {analysis.analysis.recommendation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TradeAnalyzer
