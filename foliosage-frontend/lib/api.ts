import axios from 'axios'
import { getToken, removeToken } from '@/lib/auth'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080',
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthEndpoint = (err.config?.url ?? '').startsWith('/api/auth/')
    if (err.response?.status === 401 && !isAuthEndpoint) {
      removeToken()
      if (typeof window !== 'undefined') window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
