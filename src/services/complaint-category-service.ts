import { authorizedFetch } from '@/lib/api-client'
import type { CategoriaDenunciaMock } from '@/pages/dados-mestres/dados-mestres-mock'

/** JSON shape from Spring Boot (camelCase). */
export type ComplaintCategoryDto = {
  id: string
  name: string
  description: string | null
  slaDays: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export type ComplaintCategoryWriteBody = {
  name: string
  description: string | null
  slaDays: number
  active: boolean
}

export function complaintCategoryDtoToRow(dto: ComplaintCategoryDto): CategoriaDenunciaMock {
  return {
    id: dto.id,
    nome: dto.name,
    descricao: dto.description ?? '',
    slaDias: dto.slaDays,
    ativo: dto.active,
    atualizadoEm: dto.updatedAt,
  }
}

export async function fetchComplaintCategories(): Promise<CategoriaDenunciaMock[]> {
  const res = await authorizedFetch('/api/complaint-categories')
  if (!res.ok) {
    throw new Error(`Falha ao carregar categorias (${res.status})`)
  }
  const data = (await res.json()) as ComplaintCategoryDto[]
  return data.map(complaintCategoryDtoToRow)
}

export async function fetchComplaintCategoryById(id: string): Promise<ComplaintCategoryDto> {
  const res = await authorizedFetch(`/api/complaint-categories/${id}`)
  if (res.status === 404) {
    throw new Error('not_found')
  }
  if (!res.ok) {
    throw new Error(`Falha ao carregar categoria (${res.status})`)
  }
  return res.json() as Promise<ComplaintCategoryDto>
}

export async function createComplaintCategory(body: ComplaintCategoryWriteBody): Promise<void> {
  const res = await authorizedFetch('/api/complaint-categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`Falha ao criar categoria (${res.status})`)
  }
}

export async function updateComplaintCategory(
  id: string,
  body: ComplaintCategoryWriteBody,
): Promise<void> {
  const res = await authorizedFetch(`/api/complaint-categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (res.status === 404) {
    throw new Error('not_found')
  }
  if (!res.ok) {
    throw new Error(`Falha ao atualizar categoria (${res.status})`)
  }
}
