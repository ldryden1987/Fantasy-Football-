import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getBracket, generatePlayoffs } from '../services/playoffService'
import { useAuth } from '../context/AuthContext'
import { useLeague } from '../context/LeagueContext'
import Navbar from '../components/Navbar'

const PlayoffBracket = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const { activeLeague } = useLeague()
  const [bracket, setBracket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isCommissioner, setIsCommissioner] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (activeLeague) {
      setIsCommissioner(
        activeLeague.commissioner?._id === user._id ||
        activeLeague.commissioner === user._id
      )
    }
  }, [activeLeague, user])

  useEffect(() => {
    fetchBracket()
  }, [id])

  const fetchBracket = async () => {
    setLoading(true)
    try {
      const res = await getBracket(id)
      setBracket(res.data)
    } catch (err) {
      console.error('Error fetching bracket:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await generatePlayoffs(id)
      setMessage('✅ Playoffs generated!')
      fetchBracket()
    } catch (err) {
      setMessage('❌ Failed to generate playoffs')
    } finally {
      setGenerating(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const semifinals = bracket?.matchups?.filter(m => m.playoffRound === 'semifinal') || []
  const finals = bracket?.matchups?.filter(m => m.playoffRound === 'final') || []

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-white text-xl">Loading bracket...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">🏆 Playoff Bracket</h2>
            <p className="text-gray-400 mt-1">Championship tournament</p>
          </div>
          {isCommissioner && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-yellow-900 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              {generating ? 'Generating...' : '🏆 Generate Playoffs'}
            </button>
          )}
        </div>

        {message && (
          <div className="bg-gray-800 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-6">
            {message}
          </div>
        )}

        {/* Seeds */}
        {bracket?.seeds?.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold mb-4">🌱 Playoff Seeds</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {bracket.seeds.map((team) => (
                <div key={team._id} className="bg-gray-700 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-yellow-400">#{team.seed}</p>
                  <p className="font-bold mt-1">{team.name}</p>
                  <p className="text-gray-400 text-xs">{team.owner}</p>
                  <p className="text-green-400 text-sm mt-1">
                    {team.wins}W - {team.losses}L
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bracket */}
        {semifinals.length > 0 ? (
          <div className="space-y-6">
            {/* Semifinals */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-center text-gray-400">
                — SEMIFINALS —
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {semifinals.map((matchup) => (
                  <MatchupCard key={matchup._id} matchup={matchup} />
                ))}
              </div>
            </div>

            {/* Finals */}
            {finals.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-4 text-center text-yellow-400">
                  — CHAMPIONSHIP —
                </h3>
                <div className="max-w-md mx-auto">
                  {finals.map((matchup) => (
                    <MatchupCard key={matchup._id} matchup={matchup} isChampionship />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-800 border border-dashed border-gray-700 rounded-2xl p-16 text-center">
            <p className="text-6xl mb-4">🏆</p>
            <p className="text-xl font-bold text-gray-300">Playoffs Not Started</p>
            <p className="text-gray-400 mt-2">
              {isCommissioner
                ? 'Click "Generate Playoffs" to seed teams and create the bracket'
                : 'The commissioner will generate the playoff bracket at the end of the regular season'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const MatchupCard = ({ matchup, isChampionship }) => (
  <div className={`bg-gray-800 rounded-2xl p-6 border ${
    isChampionship ? 'border-yellow-500/50' : 'border-gray-700'
  }`}>
    {isChampionship && (
      <p className="text-center text-yellow-400 text-xs font-bold mb-3">🏆 CHAMPIONSHIP</p>
    )}
    <div className="flex justify-between items-center">
      <div className="flex-1">
        <p className={`font-bold ${
          matchup.winner?._id === matchup.homeTeam?._id ? 'text-green-400' : 'text-white'
        }`}>
          {matchup.homeTeam?.name}
        </p>
        <p className="text-gray-400 text-xs">{matchup.homeTeam?.wins}W</p>
      </div>
      <div className="px-4 text-center">
        <p className="text-2xl font-black text-green-400">{matchup.homeScore?.toFixed(1)}</p>
        <p className="text-gray-500 text-xs">VS</p>
        <p className="text-2xl font-black text-green-400">{matchup.awayScore?.toFixed(1)}</p>
      </div>
      <div className="flex-1 text-right">
        <p className={`font-bold ${
          matchup.winner?._id === matchup.awayTeam?._id ? 'text-green-400' : 'text-white'
        }`}>
          {matchup.awayTeam?.name}
        </p>
        <p className="text-gray-400 text-xs">{matchup.awayTeam?.wins}W</p>
      </div>
    </div>
    <div className="text-center mt-3">
      <span className={`text-xs px-3 py-1 rounded-full ${
        matchup.status === 'completed' ? 'bg-gray-600 text-gray-400' :
        matchup.status === 'live' ? 'bg-green-500/20 text-green-400' :
        'bg-blue-500/20 text-blue-400'
      }`}>
        {matchup.status === 'completed' ? '✅ Final' :
         matchup.status === 'live' ? '🔴 Live' : '📅 Scheduled'}
      </span>
    </div>
  </div>
)

export default PlayoffBracket
