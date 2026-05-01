import { authorizedFetch } from '@/lib/api-client'
import { AUTH_MSG_SERVICO_INDISPONIVEL } from '@/services/auth/map-auth-error'
import { AuthRequestError } from '@/services/auth/types'

/** Resposta de `GET /api/perfis` e `POST /api/perfis` (entidade `Perfil`). */
export type PerfilDto = {
  id: string
  name: string
  description?: string | null
  createdAt?: string
  updatedAt?: string
}

/** Modelo de UI partilhado com a matriz de permissões (nomes em PT). */
export type ConfigPerfil = {
  id: string
  nome: string
  descricao: string
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
  if (res.status === 403) return 'Operação não permitida para este perfil.'
  if (res.status === 404) return 'Recurso não encontrado.'
  if (res.status === 409) return 'Já existe um perfil com este nome.'
  if (res.status === 400) return 'Dados inválidos.'
  return `Erro ${res.status}`
}

export function mapPerfilDtoToConfig(dto: PerfilDto): ConfigPerfil {
  const nome = (dto.name ?? '').trim()
  return {
    id: dto.id,
    nome,
    descricao: (dto.description ?? '').trim(),
  }
}

export async function fetchPerfisList(): Promise<PerfilDto[]> {
  let res: Response
  try {
    res = await authorizedFetch('/api/perfis', {
      headers: { Accept: 'application/json' },
    })
  } catch {
    throw new AuthRequestError(AUTH_MSG_SERVICO_INDISPONIVEL, 0)
  }
  if (!res.ok) {
    throw new AuthRequestError(await parseErrorMessage(res), res.status)
  }
  return res.json() as Promise<PerfilDto[]>
}

export type CreatePerfilBody = {
  name: string
  description?: string
}

export async function createPerfil(body: CreatePerfilBody): Promise<PerfilDto> {
  let res: Response
  try {
    res = await authorizedFetch('/api/perfis', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: body.name,
        ...(body.description != null && body.description !== ''
          ? { description: body.description }
          : {}),
      }),
    })
  } catch {
    throw new AuthRequestError(AUTH_MSG_SERVICO_INDISPONIVEL, 0)
  }
  if (!res.ok) {
    throw new AuthRequestError(await parseErrorMessage(res), res.status)
  }
  return res.json() as Promise<PerfilDto>
}

export async function deletePerfil(id: string): Promise<void> {
  let res: Response
  try {
    res = await authorizedFetch(`/api/perfis/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    })
  } catch {
    throw new AuthRequestError(AUTH_MSG_SERVICO_INDISPONIVEL, 0)
  }
  if (!res.ok && res.status !== 204) {
    throw new AuthRequestError(await parseErrorMessage(res), res.status)
  }
}
