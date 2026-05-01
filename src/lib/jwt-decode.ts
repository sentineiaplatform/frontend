/** Decodifica payload JWT (sem verificar assinatura — apenas leitura no cliente). */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64 = parts[1]!.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const binary = atob(padded)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    const json = new TextDecoder('utf-8').decode(bytes)
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

export function jwtEmailFromToken(token: string): string | null {
  const p = decodeJwtPayload(token)
  if (!p) return null
  const email = p.email
  return typeof email === 'string' && email.includes('@') ? email : null
}

/** Nome do perfil tal como enviado pelo backend (`users.name`), quando existe no token. */
export function jwtNameFromToken(token: string): string | null {
  const p = decodeJwtPayload(token)
  if (!p) return null
  const name = p.name
  return typeof name === 'string' && name.trim().length > 0 ? name.trim() : null
}

export function isJwtExpired(token: string, skewMs = 30_000): boolean {
  const p = decodeJwtPayload(token)
  if (!p) return true
  const exp = p.exp
  if (typeof exp !== 'number') return false
  return Date.now() >= exp * 1000 - skewMs
}
