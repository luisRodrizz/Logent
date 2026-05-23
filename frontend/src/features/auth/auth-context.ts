import { createContext } from 'react'
import type { AuthUser } from '../../types/auth'

export type AuthContextValue = {
  isAuthenticated: boolean
  isLoading: boolean
  loadUser: () => Promise<AuthUser | null>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<AuthUser | null>
  user: AuthUser | null
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
