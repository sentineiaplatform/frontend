import { authorizedFetch } from '@/lib/api-client'
import type { PrioridadeDenunciaMock } from '@/pages/dados-mestres/dados-mestres-mock'

export type ComplaintPriorityDto = {
  id: string
  code: string
  name: string
  description: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export type ComplaintPriorityWriteBody = {
  code: string
  name: string
  description: string | null
  active: boolean
}

export function complaintPriorityDtoToRow(dto: ComplaintPriorityDto): PrioridadeDenunciaMock {
  return {
    id: dto.id,
    codigo: dto.code,
    nome: dto.name,
    descricao: dto.description ?? '',
    ativo: dto.active,
    atualizadoEm: dto.updatedAt,
  }
}

export async function fetchComplaintPriorities(): Promise<PrioridadeDenunciaMock[]> {
  const res = await authorizedFetch('/api/complaint-priorities')
  if (!res.ok) throw new Error(`Falha ao carregar prioridades (${res.status})`)
  const data = (await res.json()) as ComplaintPriorityDto[]
  return data.map(complaintPriorityDtoToRow)
}

export async function fetchComplaintPriorityById(id: string): Promise<ComplaintPriorityDto> {
  const res = await authorizedFetch(`/api/complaint-priorities/${id}`)
  if (res.status === 404) throw new Error('not_found')
  if (!res.ok) throw new Error(`Falha ao carregar prioridade (${res.status})`)
  return res.json() as Promise<ComplaintPriorityDto>
}

export async function createComplaintPriority(body: ComplaintPriorityWriteBody): Promise<void> {
  const res = await authorizedFetch('/api/complaint-priorities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Falha ao criar prioridade (${res.status})`)
}

export async function updateComplaintPriority(
  id: string,
  body: ComplaintPriorityWriteBody,
): Promise<void> {
  const res = await authorizedFetch(`/api/complaint-priorities/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (res.status === 404) throw new Error('not_found')
  if (!res.ok) throw new Error(`Falha ao atualizar prioridade (${res.status})`)
}
