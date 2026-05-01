import { toast } from 'sonner'

import { AUTH_UNAUTHORIZED_EVENT } from '@/lib/auth-events'
import { getApiBaseUrl } from '@/lib/api-base-url'
import { clearStoredAccessToken, getStoredAccessToken } from '@/lib/auth-token-storage'
import { clearSessionDisplayName } from '@/lib/session-user'

/** `fetch` com cabeçalho `Authorization` quando existe token guardado. */
export function authorizedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const url = input.startsWith('http') ? input : `${getApiBaseUrl()}${input.startsWith('/') ? '' : '/'}${input}`
  const headers = new Headers(init.headers)
  const token = getStoredAccessToken()
  const sentAuthorization = Boolean(token)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return fetch(url, { ...init, headers }).then((res) => {
    // 401 sem Bearer enviado = corrida (ex.: perfil a montar logo após login) ou bug de sincronismo — não limpar sessão nem mostrar "expirada".
    if (res.status === 401 && sentAuthorization) {
      clearStoredAccessToken()
      clearSessionDisplayName()
      toast.error('Sessão expirada ou inválida', {
        description: 'Entre novamente.',
      })
      window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT))
    }
    return res
  })
}
