import api from './api'

export const getNews = () => api.get('/news')
export const refreshInjuries = () => api.get('/news/refresh')
export const getTrending = () => api.get('/news/trending')
export const getHeadlines = () => api.get('/news/headlines')
