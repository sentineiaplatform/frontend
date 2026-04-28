import { useCallback, useEffect, useState } from 'react'

import {
  getSessionDisplayName,
  sessionDisplayNameEventName,
} from '@/lib/session-user'

/** Nome exibível guardado na sessão (pré-backend). */
export function useSessionDisplayName() {
  const read = useCallback(() => getSessionDisplayName() ?? '', [])
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
