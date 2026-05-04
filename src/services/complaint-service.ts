import { authorizedFetch } from '@/lib/api-client'
import type {
  DenunciaMock,
  DenunciaPrioridade,
  DenunciaStatus,
} from '@/pages/denuncias/denuncias-mock'

type NestedDto = { id: string; name: string }
type NestedCategoryDto = NestedDto & { slaDays: number }
type NestedPriorityDto = { id: string; code: string; name: string }

export type ComplaintDto = {
  id: string
  protocol: string
  title: string
  description: string
  channel: string
  anonymous: boolean
  category: NestedCategoryDto
  status: NestedDto
  priority: NestedPriorityDto
  department: NestedDto
  createdAt: string
  updatedAt: string
}

function mapStatus(name: string): DenunciaStatus {
  const n = (name ?? '').toLowerCase()
  if (n.includes('análise') || n.includes('analise') || n.includes('pendente')) return 'em_analise'
  if (n.includes('encerrad') || n.includes('arquivad') || n.includes('suspend')) return 'encerrada'
  return 'aberta'
}

export function complaintDtoToRow(dto: ComplaintDto): DenunciaMock {
  return {
    id: dto.id,
    protocolo: dto.protocol,
    titulo: dto.title,
    registradoEm: dto.createdAt,
    categoria: dto.category?.name ?? '—',
    status: mapStatus(dto.status?.name ?? ''),
    canal: dto.channel,
    prioridade: (dto.priority?.code ?? 'P3') as DenunciaPrioridade,
    departamento: dto.department?.name ?? '—',
    atualizadoEm: dto.updatedAt,
    evidencias: [],
    relatoOriginal: dto.description,
    anonimato: dto.anonymous ? 'anonimo' : 'identificado',
    metadadosEntrada: {},
    slaTriagemHoras: (dto.category?.slaDays ?? 0) * 24,
    ativa: true,
  }
}

export async function fetchComplaints(): Promise<DenunciaMock[]> {
  const res = await authorizedFetch('/api/complaints')
  if (!res.ok) throw new Error(`Falha ao carregar denúncias (${res.status})`)
  const data = (await res.json()) as ComplaintDto[]
  return data.map(complaintDtoToRow)
}

export async function fetchComplaintById(id: string): Promise<ComplaintDto> {
  const res = await authorizedFetch(`/api/complaints/${id}`)
  if (res.status === 404) throw new Error('not_found')
  if (!res.ok) throw new Error(`Falha ao carregar denúncia (${res.status})`)
  return res.json() as Promise<ComplaintDto>
}

export async function fetchComplaintByProtocol(protocol: string): Promise<DenunciaMock> {
  const res = await authorizedFetch(`/api/complaints/protocol/${encodeURIComponent(protocol)}`)
  if (res.status === 404) throw new Error('not_found')
  if (!res.ok) throw new Error(`Falha ao carregar denúncia (${res.status})`)
  const dto = (await res.json()) as ComplaintDto
  return complaintDtoToRow(dto)
}
