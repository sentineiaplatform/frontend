import { authorizedFetch } from '@/lib/api-client'
import type { StatusDenunciaMock } from '@/pages/dados-mestres/dados-mestres-mock'

/** JSON shape from Spring Boot (camelCase). */
export type ComplaintStatusDto = {
  id: string
  name: string
  description: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export type ComplaintStatusWriteBody = {
  name: string
  description: string | null
  active: boolean
}

export function complaintStatusDtoToRow(dto: ComplaintStatusDto): StatusDenunciaMock {
  return {
    id: dto.id,
    nome: dto.name,
    descricao: dto.description ?? '',
    ativo: dto.active,
    ordem: 0,
    atualizadoEm: dto.updatedAt,
  }
}

export async function fetchComplaintStatuses(): Promise<StatusDenunciaMock[]> {
  const res = await authorizedFetch('/api/complaint-status')
  if (!res.ok) {
    throw new Error(`Falha ao carregar status (${res.status})`)
  }
  const data = (await res.json()) as ComplaintStatusDto[]
  return data.map(complaintStatusDtoToRow)
}

export async function fetchComplaintStatusById(id: string): Promise<ComplaintStatusDto> {
  const res = await authorizedFetch(`/api/complaint-status/${id}`)
  if (res.status === 404) {
    throw new Error('not_found')
  }
  if (!res.ok) {
    throw new Error(`Falha ao carregar status (${res.status})`)
  }
  return res.json() as Promise<ComplaintStatusDto>
}

export async function createComplaintStatus(body: ComplaintStatusWriteBody): Promise<void> {
  const res = await authorizedFetch('/api/complaint-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`Falha ao criar status (${res.status})`)
  }
}

export async function updateComplaintStatus(
  id: string,
  body: ComplaintStatusWriteBody,
): Promise<void> {
  const res = await authorizedFetch(`/api/complaint-status/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (res.status === 404) {
    throw new Error('not_found')
  }
  if (!res.ok) {
    throw new Error(`Falha ao atualizar status (${res.status})`)
  }
}

export async function deleteComplaintStatus(id: string): Promise<void> {
  const res = await authorizedFetch(`/api/complaint-status/${id}`, {
    method: 'DELETE',
  })
  if (res.status === 404) {
    throw new Error('not_found')
  }
  if (!res.ok) {
    throw new Error(`Falha ao remover status (${res.status})`)
  }
}
