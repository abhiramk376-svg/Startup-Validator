import axios from 'axios'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
})

// Attach the JWT (if present) to every request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('sv_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Centralized error handling: bounce to sign-in on 401
axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sv_token')
      localStorage.removeItem('sv_user')
      window.location.href = '/signin'
    }
    return Promise.reject(err)
  }
)

export default axiosClient
