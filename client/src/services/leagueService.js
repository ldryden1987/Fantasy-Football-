import api from './api'

export const createLeague = (data) => api.post('/leagues/create', data)
export const joinLeague = (data) => api.post('/leagues/join', data)
export const getMyLeagues = () => api.get('/leagues/my')
export const getLeague = (id) => api.get('/leagues/${id}')