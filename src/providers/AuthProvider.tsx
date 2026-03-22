import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import client from '@/api/client'
import type { AuthUser, LoginRequest } from '@/api/app-types'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On every app load, restore session via /me (reads httpOnly cookie server-side).
  useEffect(() => {
    client
      .get<AuthUser>('/api/auth/me')
      .then((r) => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (credentials: LoginRequest) => {
    const { data } = await client.post<AuthUser>('/api/auth/login', credentials)
    if (!data.roles.includes('SUPER_ADMIN')) {
      // Not a super admin — clear cookie and reject
      await client.post('/api/auth/logout').catch(() => undefined)
      throw new Error('Access denied. Operator access only.')
    }
    setUser(data)
  }, [])

  const logout = useCallback(async () => {
    try {
      await client.post('/api/auth/logout')
    } finally {
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
