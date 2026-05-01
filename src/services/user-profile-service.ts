import { authorizedFetch } from '@/lib/api-client'
import { AUTH_MSG_SERVICO_INDISPONIVEL } from '@/services/auth/map-auth-error'
import { AuthRequestError } from '@/services/auth/types'

export type UserProfileDto = {
  id: string
  name: string
  email: string
  perfilId: string
  perfilName: string
}

/** Item de `GET /api/users` (entidade `User` + `perfil`; sem palavra-passe na resposta JSON). */
export type UserListItemDto = {
  id: string
  name: string
  email: string
  perfil?: {
    id: string
    name: string
    description?: string | null
  }
  createdAt?: string
  updatedAt?: string
}

export type UserProfileUpdateDto = UserProfileDto & {
  accessToken: string
  tokenType: string
  expiresInMs: number
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string; message?: string; detail?: string }
    if (typeof data.error === 'string') return data.error
    if (typeof data.message === 'string') return data.message
    if (typeof data.detail === 'string') return data.detail
  } catch {
    /* ignore */
  }
  if (res.status === 401) return 'Sessão expirada ou inválida. Entre novamente.'
  if (res.status === 404) return 'Perfil não encontrado.'
  if (res.status === 409) return 'Este e-mail já está em uso.'
  if (res.status === 400) return 'Dados inválidos.'
  return `Erro ${res.status}`
}

export async function fetchUsersList(): Promise<UserListItemDto[]> {
  let res: Response
  try {
    res = await authorizedFetch('/api/users', {
      headers: { Accept: 'application/json' },
    })
  } catch {
    throw new AuthRequestError(AUTH_MSG_SERVICO_INDISPONIVEL, 0)
  }
  if (!res.ok) {
    throw new AuthRequestError(await parseErrorMessage(res), res.status)
  }
  return res.json() as Promise<UserListItemDto[]>
}

export async function fetchCurrentUserProfile(): Promise<UserProfileDto> {
  let res: Response
  try {
    res = await authorizedFetch('/api/users/me', {
      headers: { Accept: 'application/json' },
    })
  } catch {
    throw new AuthRequestError(AUTH_MSG_SERVICO_INDISPONIVEL, 0)
  }
  if (!res.ok) {
    throw new AuthRequestError(await parseErrorMessage(res), res.status)
  }
  return res.json() as Promise<UserProfileDto>
}

export type CreateUserBody = {
  name: string
  email: string
  password: string
  perfilId: string
}

/** `POST /api/users` — criação de conta (resposta sem palavra-passe). */
export async function createUser(body: CreateUserBody): Promise<UserListItemDto> {
  let res: Response
  try {
    res = await authorizedFetch('/api/users', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        password: body.password,
        perfilId: body.perfilId,
      }),
    })
  } catch {
    throw new AuthRequestError(AUTH_MSG_SERVICO_INDISPONIVEL, 0)
  }
  if (!res.ok) {
    throw new AuthRequestError(await parseErrorMessage(res), res.status)
  }
  return res.json() as Promise<UserListItemDto>
}

export async function patchCurrentUserProfile(body: {
  name: string
  email: string
  perfilId: string
}): Promise<UserProfileUpdateDto> {
  let res: Response
  try {
    res = await authorizedFetch('/api/users/me', {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        perfilId: body.perfilId,
      }),
    })
  } catch {
    throw new AuthRequestError(AUTH_MSG_SERVICO_INDISPONIVEL, 0)
  }
  if (!res.ok) {
    throw new AuthRequestError(await parseErrorMessage(res), res.status)
  }
  return res.json() as Promise<UserProfileUpdateDto>
}

/** `POST /api/users/me/password` — alterar senha (sessão atual). Resposta 204 sem corpo. */
export async function changeCurrentUserPassword(body: {
  currentPassword: string
  newPassword: string
}): Promise<void> {
  let res: Response
  try {
    res = await authorizedFetch('/api/users/me/password', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
      }),
    })
  } catch {
    throw new AuthRequestError(AUTH_MSG_SERVICO_INDISPONIVEL, 0)
  }
  if (!res.ok) {
    throw new AuthRequestError(await parseErrorMessage(res), res.status)
  }
}
