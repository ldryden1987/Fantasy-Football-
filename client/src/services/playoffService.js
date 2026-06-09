import api from './api'

export const generatePlayoffs = (leagueId) => api.post(`/playoffs/${leagueId}/generate`)
export const getBracket = (leagueId) => api.get(`/playoffs/${leagueId}/bracket`)
