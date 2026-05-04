import { authorizedFetch } from '@/lib/api-client'

export type ComplaintLinkDto = {
  id: string
  source: { id: string; protocol: string; title: string }
  target: { id: string; protocol: string; title: string }
  linkType: 'DUPLICATE' | 'RELATED' | 'FOLLOW_UP'
  note: string | null
  createdAt: string
  updatedAt: string
}

export const LINK_TYPE_LABEL: Record<ComplaintLinkDto['linkType'], string> = {
  DUPLICATE: 'Duplicada',
  RELATED: 'Relacionada',
  FOLLOW_UP: 'Seguimento',
}

export async function listLinks(complaintId: string): Promise<ComplaintLinkDto[]> {
  const res = await authorizedFetch(`/api/complaints/${encodeURIComponent(complaintId)}/links`)
  if (!res.ok) throw new Error(`Falha ao carregar vínculos (${res.status})`)
  return res.json() as Promise<ComplaintLinkDto[]>
}

export async function createLink(
  complaintId: string,
  data: { targetProtocol?: string; targetId?: string; linkType: string; note?: string },
): Promise<ComplaintLinkDto> {
  const res = await authorizedFetch(`/api/complaints/${encodeURIComponent(complaintId)}/links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (res.status === 409) throw new Error('duplicate')
  if (res.status === 404) throw new Error('not_found')
  if (res.status === 400) throw new Error('bad_request')
  if (!res.ok) throw new Error(`Falha ao criar vínculo (${res.status})`)
  return res.json() as Promise<ComplaintLinkDto>
}

export async function deleteLink(complaintId: string, linkId: string): Promise<void> {
  await authorizedFetch(
    `/api/complaints/${encodeURIComponent(complaintId)}/links/${encodeURIComponent(linkId)}`,
    { method: 'DELETE' },
  )
}
