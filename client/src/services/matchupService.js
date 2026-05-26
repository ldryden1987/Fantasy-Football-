import api from './api'

export const generateMatchups = (leagueId, week) =>
  api.post(`/matchups/${leagueId}/generate`, { week })

export const getMatchups = (leagueId, week) =>
  api.get(`/matchups/${leagueId}/week/${week}`)

export const updateScores = (leagueId, week) =>
  api.post(`/matchups/${leagueId}/score`, { week })

export const completeWeek = (leagueId, week) =>
  api.post(`/matchups/${leagueId}/complete`, { week })

export const getStandings = (leagueId) =>
  api.get(`/matchups/${leagueId}/standings`)
