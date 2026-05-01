import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { AUTH_UNAUTHORIZED_EVENT } from '@/lib/auth-events'
import { clearStoredAccessToken, getStoredAccessToken } from '@/lib/auth-token-storage'
import { isJwtExpired } from '@/lib/jwt-decode'
import { syncSessionDisplayNameFromToken } from '@/lib/sync-session-from-token'
import {
  clearSessionDisplayName,
  displayNameFromEmail,
  getSessionDisplayName,
  setSessionDisplayName,
} from '@/lib/session-user'
import type { LoginOptions } from '@/services/auth/auth-service'
import { getAuthService } from '@/services/auth'
import { AuthRequestError, type LoginCredentials } from '@/services/auth/types'

type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated'

type AuthContextValue = {
  status: AuthStatus
  isReady: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials, options?: LoginOptions) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [status, setStatus] = useState<AuthStatus>('unknown')

  const hydrate = useCallback(() => {
    const token = getStoredAccessToken()
    if (!token || isJwtExpired(token)) {
      if (token) clearStoredAccessToken()
      clearSessionDisplayName()
      setStatus('unauthenticated')
      return
    }
    syncSessionDisplayNameFromToken(token)
    setStatus('authenticated')
  }, [])

  useLayoutEffect(() => {
    hydrate()
  }, [hydrate])

  useLayoutEffect(() => {
    const onUnauthorized = () => setStatus('unauthenticated')
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized)
  }, [])

  const login = useCallback(async (credentials: LoginCredentials, options?: LoginOptions) => {
    const result = await getAuthService().login(credentials, options)
    const token = getStoredAccessToken()
    if (!token || isJwtExpired(token)) {
      if (token) clearStoredAccessToken()
      clearSessionDisplayName()
      setStatus('unauthenticated')
      throw new AuthRequestError(
        'Não foi possível guardar a sessão neste dispositivo. Verifique o armazenamento do navegador ou tente de novo.',
        0,
      )
    }
    syncSessionDisplayNameFromToken(token)
    if (!getSessionDisplayName()?.trim()) {
      if (typeof result.name === 'string' && result.name.trim().length > 0) {
        setSessionDisplayName(result.name.trim())
      } else {
        const email = credentials.email.trim().toLowerCase()
        setSessionDisplayName(displayNameFromEmail(email))
      }
    }
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    await getAuthService().logout()
    clearSessionDisplayName()
    setStatus('unauthenticated')
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      isReady: status !== 'unknown',
      isAuthenticated: status === 'authenticated',
      login,
      logout,
    }),
    [status, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.')
  }
  return ctx
}
