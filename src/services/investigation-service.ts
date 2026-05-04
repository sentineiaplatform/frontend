import { authorizedFetch } from '@/lib/api-client'

export type InvestigationDto = {
  id: string
  complaint: { id: string }
  triageDecision: string | null
  triageDecisionReason: string | null
  restrictedAccess: boolean
  factsSummary: string | null
  legalBasis: string | null
  outcome: string | null
  impactFinancial: boolean
  impactReputational: boolean
  impactRegulatory: boolean
  closureJustification: string | null
  closedAt: string | null
  leadInvestigatorName: string | null
  createdAt: string
  updatedAt: string
}

export type InternalCommentDto = {
  id: string
  authorName: string
  body: string
  createdAt: string
  updatedAt: string
}

export type InvolvedPartyDto = {
  id: string
  name: string
  roleTitle: string | null
  area: string | null
  partyType: 'ACCUSED' | 'WITNESS' | 'VICTIM'
  createdAt: string
  updatedAt: string
}

export type CorrectiveActionDto = {
  id: string
  description: string
  responsible: string | null
  dueDate: string | null
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE'
  createdAt: string
  updatedAt: string
}

export type ApprovalDecisionDto = {
  id: string
  level: 'COMPLIANCE' | 'LEGAL' | 'BOARD'
  levelOrder: number
  decision: 'APPROVED' | 'REJECTED' | 'REVIEW' | null
  justification: string | null
  decidedBy: string | null
  decidedAt: string | null
  createdAt: string
  updatedAt: string
}

// ── investigation ──────────────────────────────────────────────────────────────

export async function findOrCreateInvestigation(complaintId: string): Promise<InvestigationDto> {
  const res = await authorizedFetch(`/api/investigations/complaint/${encodeURIComponent(complaintId)}`)
  if (!res.ok) throw new Error(`Falha ao carregar investigação (${res.status})`)
  return res.json() as Promise<InvestigationDto>
}

export async function updateInvestigation(
  id: string,
  data: Partial<Omit<InvestigationDto, 'id' | 'complaint' | 'createdAt' | 'updatedAt'>>,
): Promise<InvestigationDto> {
  const res = await authorizedFetch(`/api/investigations/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Falha ao atualizar investigação (${res.status})`)
  return res.json() as Promise<InvestigationDto>
}

// ── comments ───────────────────────────────────────────────────────────────────

export async function listComments(investigationId: string): Promise<InternalCommentDto[]> {
  const res = await authorizedFetch(`/api/investigations/${encodeURIComponent(investigationId)}/comments`)
  if (!res.ok) throw new Error(`Falha ao carregar comentários (${res.status})`)
  return res.json() as Promise<InternalCommentDto[]>
}

export async function addComment(investigationId: string, authorName: string, body: string): Promise<InternalCommentDto> {
  const res = await authorizedFetch(`/api/investigations/${encodeURIComponent(investigationId)}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authorName, body }),
  })
  if (!res.ok) throw new Error(`Falha ao publicar comentário (${res.status})`)
  return res.json() as Promise<InternalCommentDto>
}

export async function deleteComment(investigationId: string, commentId: string): Promise<void> {
  await authorizedFetch(`/api/investigations/${encodeURIComponent(investigationId)}/comments/${encodeURIComponent(commentId)}`, {
    method: 'DELETE',
  })
}

// ── involved parties ───────────────────────────────────────────────────────────

export async function listInvolved(investigationId: string): Promise<InvolvedPartyDto[]> {
  const res = await authorizedFetch(`/api/investigations/${encodeURIComponent(investigationId)}/involved`)
  if (!res.ok) throw new Error(`Falha ao carregar envolvidos (${res.status})`)
  return res.json() as Promise<InvolvedPartyDto[]>
}

export async function addInvolved(
  investigationId: string,
  data: { name: string; roleTitle?: string; area?: string; partyType: string },
): Promise<InvolvedPartyDto> {
  const res = await authorizedFetch(`/api/investigations/${encodeURIComponent(investigationId)}/involved`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Falha ao adicionar envolvido (${res.status})`)
  return res.json() as Promise<InvolvedPartyDto>
}

export async function updateInvolved(
  investigationId: string,
  partyId: string,
  data: { name: string; roleTitle?: string; area?: string; partyType: string },
): Promise<InvolvedPartyDto> {
  const res = await authorizedFetch(
    `/api/investigations/${encodeURIComponent(investigationId)}/involved/${encodeURIComponent(partyId)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  )
  if (!res.ok) throw new Error(`Falha ao atualizar envolvido (${res.status})`)
  return res.json() as Promise<InvolvedPartyDto>
}

export async function deleteInvolved(investigationId: string, partyId: string): Promise<void> {
  await authorizedFetch(
    `/api/investigations/${encodeURIComponent(investigationId)}/involved/${encodeURIComponent(partyId)}`,
    { method: 'DELETE' },
  )
}

// ── corrective actions ─────────────────────────────────────────────────────────

export async function listActions(investigationId: string): Promise<CorrectiveActionDto[]> {
  const res = await authorizedFetch(`/api/investigations/${encodeURIComponent(investigationId)}/actions`)
  if (!res.ok) throw new Error(`Falha ao carregar ações (${res.status})`)
  return res.json() as Promise<CorrectiveActionDto[]>
}

export async function addAction(
  investigationId: string,
  data: { description: string; responsible?: string; dueDate?: string; status: string },
): Promise<CorrectiveActionDto> {
  const res = await authorizedFetch(`/api/investigations/${encodeURIComponent(investigationId)}/actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Falha ao adicionar ação (${res.status})`)
  return res.json() as Promise<CorrectiveActionDto>
}

export async function updateAction(
  investigationId: string,
  actionId: string,
  data: { description: string; responsible?: string; dueDate?: string; status: string },
): Promise<CorrectiveActionDto> {
  const res = await authorizedFetch(
    `/api/investigations/${encodeURIComponent(investigationId)}/actions/${encodeURIComponent(actionId)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  )
  if (!res.ok) throw new Error(`Falha ao atualizar ação (${res.status})`)
  return res.json() as Promise<CorrectiveActionDto>
}

export async function deleteAction(investigationId: string, actionId: string): Promise<void> {
  await authorizedFetch(
    `/api/investigations/${encodeURIComponent(investigationId)}/actions/${encodeURIComponent(actionId)}`,
    { method: 'DELETE' },
  )
}

// ── approval decisions ─────────────────────────────────────────────────────────

export async function listApprovals(investigationId: string): Promise<ApprovalDecisionDto[]> {
  const res = await authorizedFetch(`/api/investigations/${encodeURIComponent(investigationId)}/approvals`)
  if (!res.ok) throw new Error(`Falha ao carregar aprovações (${res.status})`)
  return res.json() as Promise<ApprovalDecisionDto[]>
}

export async function addApproval(
  investigationId: string,
  data: { level: string; levelOrder: number; decision?: string; justification?: string; decidedBy?: string },
): Promise<ApprovalDecisionDto> {
  const res = await authorizedFetch(`/api/investigations/${encodeURIComponent(investigationId)}/approvals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Falha ao adicionar aprovação (${res.status})`)
  return res.json() as Promise<ApprovalDecisionDto>
}

export async function updateApproval(
  investigationId: string,
  decisionId: string,
  data: { level: string; levelOrder: number; decision?: string; justification?: string; decidedBy?: string },
): Promise<ApprovalDecisionDto> {
  const res = await authorizedFetch(
    `/api/investigations/${encodeURIComponent(investigationId)}/approvals/${encodeURIComponent(decisionId)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  )
  if (!res.ok) throw new Error(`Falha ao atualizar aprovação (${res.status})`)
  return res.json() as Promise<ApprovalDecisionDto>
}

export async function deleteApproval(investigationId: string, decisionId: string): Promise<void> {
  await authorizedFetch(
    `/api/investigations/${encodeURIComponent(investigationId)}/approvals/${encodeURIComponent(decisionId)}`,
    { method: 'DELETE' },
  )
}
