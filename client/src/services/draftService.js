import api from './api'

export const startDraft = (leagueId) => api.post(`/draft/${leagueId}/start`)
export const getDraft = (leagueId) => api.get(`/draft/${leagueId}`)