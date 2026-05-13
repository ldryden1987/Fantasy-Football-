import api from './api'

export const getPlayers = (params) => api.get('/players', {params})
export const getPlayer = (id) => api.get('/players/${id}')