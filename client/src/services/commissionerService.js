import api from './api'

export const getDashboard = (leagueId) => api.get(`/commissioner/${leagueId}/dashboard`)
export const updateSettings = (leagueId, data) => api.put(`/commissioner/${leagueId}/settings`, data)
export const vetoTrade = (tradeId) => api.post(`/commissioner/${tradeId}/veto`)
export const resetWaivers = (leagueId) => api.post(`/commissioner/${leagueId}/reset-waivers`)
export const removeTeam = (leagueId, teamId) => api.delete(`/commissioner/${leagueId}/remove-team/${teamId}`)
