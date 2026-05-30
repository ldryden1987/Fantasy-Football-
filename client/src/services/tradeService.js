import api from './api'

export const sendTrade = (leagueId, data) => api.post(`/trades/${leagueId}/send`, data)
export const acceptTrade = (tradeId) => api.post(`/trades/${tradeId}/accept`)
export const rejectTrade = (tradeId) => api.post(`/trades/${tradeId}/reject`)
export const cancelTrade = (tradeId) => api.post(`/trades/${tradeId}/cancel`)
export const getTrades = (leagueId) => api.get(`/trades/${leagueId}`)
