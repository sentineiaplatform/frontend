/**
 * Leitura do fluxo guardado (mesma chave que o editor em Dados mestres → Workflows)
 * para alinhar a área de investigação da denúncia ao diagrama.
 */
import { createDemoWorkflowGraph, type StatusNodeData, type WfEdge, type WfNode } from '@/pages/dados-mestres/workflows/workflow-mocks'
import {
  WORKFLOW_DRAFT_STORAGE_KEY,
  parseWorkflowDraft,
} from '@/pages/dados-mestres/workflows/workflow-editor-store'
import type { DenunciaStatus } from '@/pages/denuncias/denuncias-mock'

export type WorkflowRuntimeStep = {
  nodeId: string
  label: string
  statusId: string
  isInitial: boolean
  isTerminal: boolean
}

/** Índices em `steps` ordenados pela posição dos nós no diagrama (X, depois Y): fluxo esquerda → direita. */
export function computeVisualFlowStepOrder(steps: WorkflowRuntimeStep[], nodes: WfNode[]): number[] {
  if (steps.length === 0) return []
  const nodeById = new Map(nodes.filter((n) => n.type === 'statusNode').map((n) => [n.id, n]))
  const enriched = steps.map((s, stepIndex) => {
    const n = nodeById.get(s.nodeId)
    const x = n?.position.x ?? 0
    const y = n?.position.y ?? 0
    return { stepIndex, x, y, label: s.label }
  })
  enriched.sort((a, b) => {
    if (a.x !== b.x) return a.x - b.x
    if (a.y !== b.y) return a.y - b.y
    return a.label.localeCompare(b.label, 'pt')
  })
  return enriched.map((e) => e.stepIndex)
}

export function loadWorkflowRuntimeGraph(): { nodes: WfNode[]; edges: WfEdge[] } {
  try {
    const raw = localStorage.getItem(WORKFLOW_DRAFT_STORAGE_KEY)
    if (raw) {
      const p = parseWorkflowDraft(raw)
      if (p?.nodes?.length) {
        return { nodes: p.nodes as WfNode[], edges: p.edges as WfEdge[] }
      }
    }
  } catch {
    /* fallback demo */
  }
  return createDemoWorkflowGraph()
}

export function buildOrderedWorkflowSteps(nodes: WfNode[], edges: WfEdge[]): WorkflowRuntimeStep[] {
  const statusNodes = nodes.filter((n): n is WfNode => n.type === 'statusNode')
  if (statusNodes.length === 0) return []

  const byId = new Map(statusNodes.map((n) => [n.id, n]))
  const initial = statusNodes.find((n) => n.data.isInitial) ?? statusNodes[0]!

  const outgoing = new Map<string, string[]>()
  for (const e of edges) {
    if (!byId.has(e.source) || !byId.has(e.target)) continue
    const arr = outgoing.get(e.source) ?? []
    arr.push(e.target)
    outgoing.set(e.source, arr)
  }

  for (const [src, targets] of outgoing) {
    targets.sort((a, b) => {
      const na = byId.get(a)
      const nb = byId.get(b)
      return (na?.position.x ?? 0) - (nb?.position.x ?? 0)
    })
    outgoing.set(src, targets)
  }

  const ordered: WorkflowRuntimeStep[] = []
  const seen = new Set<string>()
  const queue = [initial.id]

  while (queue.length > 0) {
    const id = queue.shift()!
    if (seen.has(id)) continue
    seen.add(id)
    const n = byId.get(id)
    if (!n) continue
    ordered.push({
      nodeId: n.id,
      label: n.data.label,
      statusId: n.data.statusId,
      isInitial: n.data.isInitial,
      isTerminal: n.data.isTerminal,
    })
    for (const t of outgoing.get(id) ?? []) {
      if (!seen.has(t)) queue.push(t)
    }
  }

  const rest = statusNodes
    .filter((n) => !seen.has(n.id))
    .sort((a, b) => a.position.x - b.position.x)
  for (const n of rest) {
    ordered.push({
      nodeId: n.id,
      label: n.data.label,
      statusId: n.data.statusId,
      isInitial: n.data.isInitial,
      isTerminal: n.data.isTerminal,
    })
  }

  return ordered
}

/**
 * Nó de entrada do fluxo (área de trabalho — estado «aberta» deve ancorar aqui, não na triagem).
 */
export function inferInitialWorkflowStepIndex(steps: WorkflowRuntimeStep[]): number {
  if (steps.length === 0) return 0
  const initialIdx = steps.findIndex((s) => s.isInitial)
  if (initialIdx >= 0) return initialIdx
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
  const recIdx = steps.findIndex((s) => {
    const l = norm(s.label)
    return l.includes('rececao') || l.includes('recepcao') || l.includes('recep')
  })
  if (recIdx >= 0) return recIdx
  return 0
}

export function inferCurrentStepIndex(status: DenunciaStatus, steps: WorkflowRuntimeStep[]): number {
  if (steps.length === 0) return 0
  const last = steps.length - 1
  const L = (s: string) => s.toLowerCase()

  if (status === 'encerrada') {
    const term = steps.findIndex((s) => s.isTerminal)
    return term >= 0 ? term : last
  }
  if (status === 'aberta') {
    return inferInitialWorkflowStepIndex(steps)
  }
  if (status === 'em_analise') {
    const inv = steps.findIndex((s) => L(s.label).includes('investig'))
    if (inv >= 0) return inv
    const tri = steps.findIndex((s) => L(s.label).includes('triagem'))
    if (tri >= 0) return tri
    return Math.min(2, last)
  }
  return inferInitialWorkflowStepIndex(steps)
}

export function outgoingTransitionsFromStep(
  stepNodeId: string,
  edges: WfEdge[],
  nodes: WfNode[],
): { edgeId: string; label: string; targetLabel: string; targetNodeId: string }[] {
  const statusNodes = nodes.filter((n) => n.type === 'statusNode')
  const byId = new Map(statusNodes.map((n) => [n.id, n]))
  return edges
    .filter((e) => e.source === stepNodeId && byId.has(e.target))
    .map((e) => {
      const target = byId.get(e.target)!
      const dataLabel = e.data?.label
      const edgeLabel =
        typeof dataLabel === 'string' && dataLabel.trim()
          ? dataLabel
          : typeof e.label === 'string' && e.label.trim()
            ? e.label
            : 'Avançar'
      return {
        edgeId: e.id,
        label: edgeLabel,
        targetLabel: (target.data as StatusNodeData).label,
        targetNodeId: e.target,
      }
    })
}
