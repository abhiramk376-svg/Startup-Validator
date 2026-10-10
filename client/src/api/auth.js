import axiosClient from './axiosClient.js'

export async function registerUser({ fullName, email, password }) {
  const { data } = await axiosClient.post('/auth/register', { fullName, email, password })
  return data // { user, token }
}

export async function loginUser({ email, password }) {
  const { data } = await axiosClient.post('/auth/login', { email, password })
  return data // { user, token }
}

export async function fetchCurrentUser() {
  const { data } = await axiosClient.get('/auth/me')
  return data // { user }
}
