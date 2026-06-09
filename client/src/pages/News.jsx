import { useEffect, useState } from 'react'
import { getNews, getTrending, refreshInjuries } from '../services/newsService'
import Navbar from '../components/Navbar'

const injuryColors = {
  'Out': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Doubtful': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Questionable': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'IR': 'bg-red-700/20 text-red-500 border-red-700/30',
  'PUP': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

const positionColors = {
  QB: 'bg-red-500/20 text-red-400',
  RB: 'bg-blue-500/20 text-blue-400',
  WR: 'bg-green-500/20 text-green-400',
  TE: 'bg-yellow-500/20 text-yellow-400',
  K: 'bg-purple-500/20 text-purple-400',
  DEF: 'bg-gray-500/20 text-gray-400',
}

const News = () => {
  const [injuries, setInjuries] = useState([])
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('injuries')
  const [posFilter, setPosFilter] = useState('All')

  const POSITIONS = ['All', 'QB', 'RB', 'WR', 'TE']

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [newsRes, trendingRes] = await Promise.all([
        getNews(),
        getTrending()
      ])
      setInjuries(newsRes.data)
      setTrending(trendingRes.data)
    } catch (err) {
      console.error('Error fetching news:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshInjuries()
      await fetchAll()
    } catch (err) {
      console.error('Error refreshing:', err)
    } finally {
      setRefreshing(false)
    }
  }

  const filteredInjuries = injuries.filter(p =>
    posFilter === 'All' || p.position === posFilter
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">📰 Player News</h2>
            <p className="text-gray-400 mt-1">Injury reports and trending players</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Data'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['injuries', 'trending'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab === 'injuries' ? '🤕 Injury Report' : '🔥 Trending'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-400 text-lg">Loading player news...</p>
          </div>
        ) : activeTab === 'injuries' ? (
          <>
            {/* Position Filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {POSITIONS.map(pos => (
                <button
                  key={pos}
                  onClick={() => setPosFilter(pos)}
                  className={`px-4 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    posFilter === pos
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>

            <p className="text-gray-400 text-sm mb-4">
              {filteredInjuries.length} players on injury report
            </p>

            <div className="space-y-3">
              {filteredInjuries.map((player, i) => (
                <div
                  key={i}
                  className={`bg-gray-800 border rounded-xl p-5 ${
                    injuryColors[player.injuryStatus]?.split(' ')[2] || 'border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${positionColors[player.position]}`}>
                        {player.position}
                      </span>
                      <div>
                        <p className="font-bold text-lg">{player.name}</p>
                        <p className="text-gray-400 text-sm">{player.team}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${
                        injuryColors[player.injuryStatus] || 'bg-gray-600 text-gray-300 border-gray-500'
                      }`}>
                        {player.injuryStatus}
                      </span>
                      {player.injuryBodyPart && (
                        <p className="text-gray-400 text-xs mt-1">{player.injuryBodyPart}</p>
                      )}
                    </div>
                  </div>
                  {player.injuryNotes && player.injuryNotes !== 'No details available' && (
                    <p className="text-gray-300 text-sm mt-3 border-t border-gray-700 pt-3">
                      {player.injuryNotes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-4">
              Top {trending.length} most searched players right now
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {trending.map((player, i) => (
                <div
                  key={i}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 font-bold text-lg w-8">
                      #{i + 1}
                    </span>
                    <div>
                      <p className="font-bold">{player.name}</p>
                      <p className="text-gray-400 text-sm">{player.team}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${positionColors[player.position]}`}>
                    {player.position}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default News
