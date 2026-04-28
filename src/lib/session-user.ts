/** Chave única até existir SDK / JWT com perfil real. */

export const SESSION_DISPLAY_NAME_KEY = 'sentine:userDisplayName'

const SESSION_UPDATED_EVENT = 'sentine:session-display-name'

export function getSessionDisplayName(): string | null {
  try {
    return sessionStorage.getItem(SESSION_DISPLAY_NAME_KEY)
  } catch {
    return null
  }
}

export function setSessionDisplayName(name: string) {
  const trimmed = name.trim()
  if (trimmed.length === 0) {
    sessionStorage.removeItem(SESSION_DISPLAY_NAME_KEY)
  } else {
    sessionStorage.setItem(SESSION_DISPLAY_NAME_KEY, trimmed)
  }
  globalThis.dispatchEvent(new Event(SESSION_UPDATED_EVENT))
}

export function sessionDisplayNameEventName(): string {
  return SESSION_UPDATED_EVENT
}

/** Gera um nome amigável a partir do local do e-mail (até existir API de perfil). */
export function displayNameFromEmail(email: string): string {
  const local = email.trim().split('@')[0] ?? ''
  if (!local) return 'Usuário'
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

/** Iniciais para avatar (nome composto ou palavra única). */
export function displayNameInitials(displayName: string): string {
  const t = displayName.trim()
  if (!t) return '?'
  const parts = t.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    const first = parts.at(0) ?? ''
    const last = parts.at(-1) ?? ''
    const a = first.at(0) ?? ''
    const b = last.at(0) ?? ''
    return `${a}${b}`.toUpperCase().slice(0, 2)
  }
  const s = parts.at(0) ?? t
  return s.slice(0, 2).toUpperCase()
}
