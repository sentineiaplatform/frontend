const ACCESS_TOKEN_KEY = 'sentineia:accessToken'

/** Disparado na mesma aba quando o token é guardado ou limpo (localStorage não faz `storage` na própria aba). */
const ACCESS_TOKEN_UPDATED_EVENT = 'sentineia:access-token-updated'

export function accessTokenUpdatedEventName(): string {
  return ACCESS_TOKEN_UPDATED_EVENT
}

export function getStoredAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY) ?? sessionStorage.getItem(ACCESS_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setStoredAccessToken(token: string, remember: boolean) {
  clearStoredAccessToken()
  const s = remember ? localStorage : sessionStorage
  try {
    s.setItem(ACCESS_TOKEN_KEY, token)
  } catch {
    /* quota / private mode */
  }
  globalThis.dispatchEvent(new Event(ACCESS_TOKEN_UPDATED_EVENT))
}

export function clearStoredAccessToken() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  } catch {
    /* ignore */
  }
  globalThis.dispatchEvent(new Event(ACCESS_TOKEN_UPDATED_EVENT))
}

/** Mantém o mesmo armazenamento que já tinha token (local vs sessão). */
export function getAccessTokenRememberPreference(): boolean {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY) != null
  } catch {
    return false
  }
}

/**
 * Espera até o token existir no storage (evento do próprio `setStoredAccessToken` ou timeout).
 * Útil logo após login/navegação quando o primeiro GET autenticado corre no mesmo instante que a escrita do token.
 */
export function waitForStoredAccessToken(maxWaitMs = 400): Promise<string | null> {
  const existing = getStoredAccessToken()
  if (existing) return Promise.resolve(existing)

  return new Promise((resolve) => {
    const evt = ACCESS_TOKEN_UPDATED_EVENT
    const finish = () => resolve(getStoredAccessToken())

    const onTokenUpdated = () => {
      const t = getStoredAccessToken()
      if (t) {
        cleanup()
        resolve(t)
      }
    }

    const timer = window.setTimeout(() => {
      cleanup()
      finish()
    }, maxWaitMs)

    function cleanup() {
      clearTimeout(timer)
      globalThis.removeEventListener(evt, onTokenUpdated)
    }

    globalThis.addEventListener(evt, onTokenUpdated)
    queueMicrotask(onTokenUpdated)
  })
}
