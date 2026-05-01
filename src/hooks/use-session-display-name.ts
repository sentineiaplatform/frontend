import { useCallback, useEffect, useState } from 'react'

import { getStoredAccessToken } from '@/lib/auth-token-storage'
import { jwtEmailFromToken, jwtNameFromToken } from '@/lib/jwt-decode'
import {
  displayNameFromEmail,
  getSessionDisplayName,
  sessionDisplayNameEventName,
} from '@/lib/session-user'

/** Nome exibível: prioriza `name` no JWT, depois sessão, depois fallback a partir do e-mail no token. */
export function useSessionDisplayName() {
  const read = useCallback(() => {
    const token = getStoredAccessToken()
    const nameJwt = token ? jwtNameFromToken(token) : null
    if (nameJwt) return nameJwt
    const stored = getSessionDisplayName()?.trim()
    if (stored) return stored
    const email = token ? jwtEmailFromToken(token) : null
    return email ? displayNameFromEmail(email) : ''
  }, [])

  const [displayName, setDisplayName] = useState(read)

  useEffect(() => {
    const evt = sessionDisplayNameEventName()
    const sync = () => setDisplayName(read())

    sync()
    globalThis.addEventListener(evt, sync)
    globalThis.addEventListener('storage', sync)
    return () => {
      globalThis.removeEventListener(evt, sync)
      globalThis.removeEventListener('storage', sync)
    }
  }, [read])

  return displayName
}
