import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AUTH_TOKEN_CLEARED_EVENT, clearAccessToken, getAccessToken, setAccessToken } from '../../lib/auth'
import type { AuthUser, LoginResponse, RegisterCompanyRequest } from '../../types/auth'
import { getCurrentUser, login as loginRequest, registerCompany as registerCompanyRequest } from './auth.api'
import { AuthContext } from './auth-context'

type AuthProviderProps = {
  children: ReactNode
}

function buildUserFromLoginResponse(response: LoginResponse): AuthUser {
  return {
    id: '',
    email: response.email,
    fullName: response.fullName,
    roles: response.roles,
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null)
      return null
    }

    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      return currentUser
    } catch {
      clearAccessToken()
      setUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function bootstrapSession() {
      if (!getAccessToken()) {
        if (isMounted) {
          setUser(null)
          setIsLoading(false)
        }
        return
      }

      try {
        const currentUser = await getCurrentUser()
        if (isMounted) {
          setUser(currentUser)
        }
      } catch {
        clearAccessToken()
        if (isMounted) {
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void bootstrapSession()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    function handleTokenCleared() {
      setUser(null)
    }

    window.addEventListener(AUTH_TOKEN_CLEARED_EVENT, handleTokenCleared)

    return () => {
      window.removeEventListener(AUTH_TOKEN_CLEARED_EVENT, handleTokenCleared)
    }
  }, [])

  const establishSession = useCallback(async (response: LoginResponse): Promise<AuthUser> => {
    setAccessToken(response.token)

    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      return currentUser
    } catch {
      const fallbackUser = buildUserFromLoginResponse(response)
      setUser(fallbackUser)
      return fallbackUser
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await loginRequest({ email, password })
      return establishSession(response)
    },
    [establishSession],
  )

  const registerCompany = useCallback(
    async (payload: RegisterCompanyRequest) => {
      return registerCompanyRequest(payload)
    },
    [],
  )

  const logout = useCallback(() => {
    clearAccessToken()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      isLoading,
      loadUser,
      login,
      logout,
      registerCompany,
      refreshUser: loadUser,
      user,
    }),
    [isLoading, loadUser, login, logout, registerCompany, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
