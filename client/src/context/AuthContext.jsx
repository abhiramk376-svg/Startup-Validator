import { createContext, useContext, useEffect, useState } from 'react'
import { loginUser, registerUser } from '../api/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('sv_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) localStorage.setItem('sv_user', JSON.stringify(user))
  }, [user])

  async function signUp({ fullName, email, password }) {
    setLoading(true)
    setError(null)
    try {
      const { user: newUser, token } = await registerUser({ fullName, email, password })
      localStorage.setItem('sv_token', token)
      setUser(newUser)
      return newUser
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create account')
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function signIn({ email, password }) {
    setLoading(true)
    setError(null)
    try {
      const { user: existingUser, token } = await loginUser({ email, password })
      localStorage.setItem('sv_token', token)
      setUser(existingUser)
      return existingUser
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
      throw err
    } finally {
      setLoading(false)
    }
  }

  function signOut() {
    localStorage.removeItem('sv_token')
    localStorage.removeItem('sv_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
