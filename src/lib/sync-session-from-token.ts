import { jwtEmailFromToken, jwtNameFromToken } from '@/lib/jwt-decode'
import { displayNameFromEmail, setSessionDisplayName } from '@/lib/session-user'

/** Atualiza o nome em sessão a partir dos claims do JWT (login ou novo token após PATCH perfil). */
export function syncSessionDisplayNameFromToken(token: string) {
  const nameFromJwt = jwtNameFromToken(token)
  const email = jwtEmailFromToken(token)
  const label =
    nameFromJwt ?? (email ? displayNameFromEmail(email) : '')
  if (label) setSessionDisplayName(label)
}
