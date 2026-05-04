import { authorizedFetch } from '@/lib/api-client'
import type { DepartamentoDenunciaMock } from '@/pages/dados-mestres/dados-mestres-mock'

export type ComplaintDepartmentDto = {
  id: string
  name: string
  description: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export type ComplaintDepartmentWriteBody = {
  name: string
  description: string | null
  active: boolean
}

export function complaintDepartmentDtoToRow(dto: ComplaintDepartmentDto): DepartamentoDenunciaMock {
  return {
    id: dto.id,
    nome: dto.name,
    descricao: dto.description ?? '',
    ativo: dto.active,
    atualizadoEm: dto.updatedAt,
  }
}

export async function fetchComplaintDepartments(): Promise<DepartamentoDenunciaMock[]> {
  const res = await authorizedFetch('/api/complaint-departments')
  if (!res.ok) throw new Error(`Falha ao carregar departamentos (${res.status})`)
  const data = (await res.json()) as ComplaintDepartmentDto[]
  return data.map(complaintDepartmentDtoToRow)
}

export async function fetchComplaintDepartmentById(id: string): Promise<ComplaintDepartmentDto> {
  const res = await authorizedFetch(`/api/complaint-departments/${id}`)
  if (res.status === 404) throw new Error('not_found')
  if (!res.ok) throw new Error(`Falha ao carregar departamento (${res.status})`)
  return res.json() as Promise<ComplaintDepartmentDto>
}

export async function createComplaintDepartment(body: ComplaintDepartmentWriteBody): Promise<void> {
  const res = await authorizedFetch('/api/complaint-departments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Falha ao criar departamento (${res.status})`)
}

export async function updateComplaintDepartment(
  id: string,
  body: ComplaintDepartmentWriteBody,
): Promise<void> {
  const res = await authorizedFetch(`/api/complaint-departments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (res.status === 404) throw new Error('not_found')
  if (!res.ok) throw new Error(`Falha ao atualizar departamento (${res.status})`)
}
