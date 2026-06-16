import { useEffect, useState, useRef } from 'react'
import { getHeadlines } from '../services/newsService'

const HeadlinesFeed = () => {
  const [headlines, setHeadlines] = useState([])
  const [loading, setLoading] = useState(true)
  const sliderRef = useRef(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getHeadlines()
        setHeadlines(res.data)
      } catch (err) {
        console.error('Error fetching headlines:', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const scroll = (dir) => {
    if (!sliderRef.current) return
    sliderRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">📰 NFL Headlines</h3>
        <p className="text-gray-400 text-sm">Loading headlines...</p>
      </div>
    )
  }

  if (headlines.length === 0) return null

  const gridItems = headlines.slice(0, 4)
  const sliderItems = headlines.slice(4)

  return (
    <div className="bg-gray-800 rounded-2xl p-6">
      <h3 className="text-xl font-bold mb-4">📰 NFL Headlines</h3>

      {/* Top 4 — Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {gridItems.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:border-green-500 transition-colors flex flex-col"
          >
            <div className="aspect-video bg-gray-700 overflow-hidden">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-600/30 to-gray-800">
                  <span className="text-3xl">🏈</span>
                </div>
              )}
            </div>
            <div className="p-3 flex-1 flex flex-col">
              <p className="font-semibold text-sm leading-snug line-clamp-3">
                {item.title}
              </p>
              <p className="text-gray-500 text-xs mt-2">{timeAgo(item.pubDate)}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Remaining — Slider */}
      {sliderItems.length > 0 && (
        <div className="relative">
          <div className="flex justify-between items-center mb-2">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
              More Headlines
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => scroll(-1)}
                className="bg-gray-700 hover:bg-gray-600 text-white w-7 h-7 rounded-full text-sm transition-colors"
              >
                ‹
              </button>
              <button
                onClick={() => scroll(1)}
                className="bg-gray-700 hover:bg-gray-600 text-white w-7 h-7 rounded-full text-sm transition-colors"
              >
                ›
              </button>
            </div>
          </div>

          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
            style={{ scrollbarWidth: 'none' }}
          >
            {sliderItems.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group shrink-0 w-64 bg-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:border-green-500 transition-colors"
              >
                <div className="aspect-video bg-gray-700 overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-600/30 to-gray-800">
                      <span className="text-2xl">🏈</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-xs leading-snug line-clamp-3">
                    {item.title}
                  </p>
                  <p className="text-gray-500 text-xs mt-2">{timeAgo(item.pubDate)}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default HeadlinesFeed

