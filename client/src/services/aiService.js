import api from './api'

export const analyzeTrade = (data) => api.post('/ai/analyze-trade', data)
export const getRosterAdvice = (data) => api.post('/ai/roster-advice', data)