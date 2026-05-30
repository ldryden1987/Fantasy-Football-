import api from './api'

export const claimPlayer = (leagueId, data) => api.post(`/waivers/${leagueId}/claim`, data)
export const processWaivers = (leagueId) => api.post(`/waivers/${leagueId}/process`)
export const getWaivers = (leagueId) => api.get(`/waivers/${leagueId}`)
