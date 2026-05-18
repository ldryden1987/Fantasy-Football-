import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const DraftContext = createContext()

export const DraftProvider = ({ children }) => {
  const { user } = useAuth()
  const [draft, setDraft] = useState(null)
  const [lastPick, setLastPick] = useState(null)
  const [timer, setTimer] = useState(60)
  const [connected, setConnected] = useState(false)
  const socketRef = useRef(null)
  const timerRef = useRef(null)

  const connectToDraft = (leagueId, teamId) => {
    if (socketRef.current) socketRef.current.disconnect()

    const socket = io('http://localhost:8080')
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('join_draft', { leagueId, teamId })
    })

    socket.on('draft_state', (draftData) => {
      setDraft(draftData)
    })

    socket.on('pick_made', ({ draft: updatedDraft, lastPick }) => {
      setDraft(updatedDraft)
      setLastPick(lastPick)
    })

    socket.on('pick_timer_start', ({ seconds }) => {
      setTimer(seconds)
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    })

    socket.on('draft_completed', () => {
      setDraft(prev => ({ ...prev, status: 'completed' }))
      if (timerRef.current) clearInterval(timerRef.current)
    })

    socket.on('disconnect', () => setConnected(false))
  }

  const makePick = (leagueId, teamId, playerId) => {
    if (socketRef.current) {
      socketRef.current.emit('make_pick', { leagueId, teamId, playerId })
    }
  }

  const disconnectDraft = () => {
    if (socketRef.current) socketRef.current.disconnect()
    if (timerRef.current) clearInterval(timerRef.current)
  }

  return (
    <DraftContext.Provider value={{
      draft,
      lastPick,
      timer,
      connected,
      connectToDraft,
      makePick,
      disconnectDraft
    }}>
      {children}
    </DraftContext.Provider>
  )
}

export const useDraft = () => useContext(DraftContext)
