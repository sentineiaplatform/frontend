import { authorizedFetch } from '@/lib/api-client'
import { AUTH_MSG_SERVICO_INDISPONIVEL } from '@/services/auth/map-auth-error'
import { AuthRequestError } from '@/services/auth/types'
import type { ConfigAuditLogEntry } from '@/pages/configuracoes/configuracoes-audit-log'

export type AuditLogDto = {
  id: string
  occurredAt: string
  actorUserId: string | null
  actorEmail: string | null
  category: string
  action: string
  detail: string | null
}

export type AuditLogPageDto = {
  content: AuditLogDto[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  last: boolean
}

const LEGAL_CATEGORIES: ReadonlySet<ConfigAuditLogEntry['category']> = new Set([
  'geral',
  'perfil',
  'seguranca',
  'membros',
  'perfis',
  'permissoes',
  'integracao',
  'notificacoes',
  'auth',
])

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
  return `Erro ${res.status}`
}

export async function fetchAuditLogsPage(params: {
  page?: number
  size?: number
  category?: string
}): Promise<AuditLogPageDto> {
  const page = params.page ?? 0
  const size = params.size ?? 100
  const q = new URLSearchParams()
  q.set('page', String(page))
  q.set('size', String(size))
  if (params.category != null && params.category.trim() !== '') {
    q.set('category', params.category.trim())
  }
  let res: Response
  try {
    res = await authorizedFetch(`/api/audit/logs?${q.toString()}`, {
      headers: { Accept: 'application/json' },
    })
  } catch {
    throw new AuthRequestError(AUTH_MSG_SERVICO_INDISPONIVEL, 0)
  }
  if (!res.ok) {
    throw new AuthRequestError(await parseErrorMessage(res), res.status)
  }
  return res.json() as Promise<AuditLogPageDto>
}

/** Busca todas as páginas até `last` (limite de segurança de páginas). */
export async function fetchAllAuditLogsMapped(maxPages = 30): Promise<ConfigAuditLogEntry[]> {
  const out: ConfigAuditLogEntry[] = []
  let page = 0
  while (page < maxPages) {
    const chunk = await fetchAuditLogsPage({ page, size: 100 })
    for (const row of chunk.content) {
      out.push(mapAuditDtoToEntry(row))
    }
    if (chunk.last || chunk.content.length === 0) break
    page += 1
  }
  return out.sort((a, b) => b.at.localeCompare(a.at))
}

export function mapAuditDtoToEntry(d: AuditLogDto): ConfigAuditLogEntry {
  const catRaw = (d.category ?? 'geral').trim().toLowerCase()
  const category = LEGAL_CATEGORIES.has(catRaw as ConfigAuditLogEntry['category'])
    ? (catRaw as ConfigAuditLogEntry['category'])
    : 'geral'

  const parts: string[] = []
  if (d.detail != null && d.detail.trim() !== '') parts.push(d.detail.trim())
  if (d.actorEmail != null && d.actorEmail.trim() !== '') {
    parts.push(`Utilizador: ${d.actorEmail.trim()}`)
  }
  const detail = parts.length > 0 ? parts.join(' · ') : undefined

  return {
    id: d.id,
    at: d.occurredAt,
    category,
    action: d.action,
    detail,
    actorEmail: d.actorEmail?.trim() ?? undefined,
    source: 'api',
  }
}
