import { getApiBaseUrl } from '@/lib/api-base-url'
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken,
} from '@/lib/auth-token-storage'
import type { AuthService } from '@/services/auth/auth-service'
import { AUTH_MSG_SERVICO_INDISPONIVEL } from '@/services/auth/map-auth-error'
import type { LoginCredentials, LoginResult } from '@/services/auth/types'
import { AuthRequestError } from '@/services/auth/types'

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string; message?: string }
    if (typeof data.error === 'string') return data.error
    if (typeof data.message === 'string') return data.message
  } catch {
    /* ignore */
  }
  if (res.status === 401) return 'Credenciais inválidas.'
  if (res.status === 400) return 'Dados inválidos.'
  return `Erro ${res.status}`
}

export function createBackendAuthService(): AuthService {
  const base = () => getApiBaseUrl()

  return {
    async login(credentials: LoginCredentials, options) {
      let res: Response
      try {
        res = await fetch(`${base()}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            email: credentials.email.trim().toLowerCase(),
            password: credentials.password,
          }),
        })
      } catch {
        throw new AuthRequestError(AUTH_MSG_SERVICO_INDISPONIVEL, 0)
      }

      if (!res.ok) {
        throw new AuthRequestError(await parseErrorMessage(res), res.status)
      }

      const data = (await res.json()) as LoginResult
      if (!data.accessToken) {
        throw new AuthRequestError('Resposta inválida do servidor.', res.status)
      }
      setStoredAccessToken(data.accessToken, options?.remember === true)
      return data
    },

    async logout() {
      const token = getStoredAccessToken()
      if (token) {
        try {
          await fetch(`${base()}/api/auth/logout`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          })
        } catch {
          /* rede: continua a limpar local */
        }
      }
      clearStoredAccessToken()
    },
  }
}
