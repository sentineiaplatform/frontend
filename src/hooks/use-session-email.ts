import { useCallback, useEffect, useState } from 'react'

import {
  accessTokenUpdatedEventName,
  getStoredAccessToken,
} from '@/lib/auth-token-storage'
import { jwtEmailFromToken } from '@/lib/jwt-decode'
import { sessionDisplayNameEventName } from '@/lib/session-user'

/** E-mail do JWT atual (sincroniza com login/logout e mudanças de sessão). */
export function useSessionEmail() {
  const read = useCallback(() => {
    const token = getStoredAccessToken()
    if (!token) return ''
    return jwtEmailFromToken(token)?.trim().toLowerCase() ?? ''
  }, [])

  const [email, setEmail] = useState(read)

  useEffect(() => {
    const sync = () => setEmail(read())

    sync()
    const displayEvt = sessionDisplayNameEventName()
    const tokenEvt = accessTokenUpdatedEventName()
    globalThis.addEventListener(displayEvt, sync)
    globalThis.addEventListener(tokenEvt, sync)
    globalThis.addEventListener('storage', sync)
    return () => {
      globalThis.removeEventListener(displayEvt, sync)
      globalThis.removeEventListener(tokenEvt, sync)
      globalThis.removeEventListener('storage', sync)
    }
  }, [read])

  return email
}
