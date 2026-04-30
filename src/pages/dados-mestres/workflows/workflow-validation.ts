import type { WfEdge, WfNode } from '@/pages/dados-mestres/workflows/workflow-mocks'

export type WorkflowValidationResult = {
  errors: string[]
  warnings: string[]
}

function hasDirectedCycle(nodes: WfNode[], edges: WfEdge[]): boolean {
  const ids = nodes.map((n) => n.id)
  const g = new Map<string, string[]>()
  for (const id of ids) g.set(id, [])
  for (const e of edges) {
    if (g.has(e.source) && g.has(e.target)) g.get(e.source)!.push(e.target)
  }
  const mark = new Map<string, 0 | 1 | 2>()
  for (const id of ids) mark.set(id, 0)
  const visit = (u: string): boolean => {
    mark.set(u, 1)
    for (const v of g.get(u) ?? []) {
      if (mark.get(v) === 1) return true
      if (mark.get(v) === 0 && visit(v)) return true
    }
    mark.set(u, 2)
    return false
  }
  for (const id of ids) {
    if (mark.get(id) === 0 && visit(id)) return true
  }
  return false
}

function isIsolated(nodeId: string, edges: WfEdge[]): boolean {
  return !edges.some((e) => e.source === nodeId || e.target === nodeId)
}

/** Validações de produto só no cliente (mock). */
export function computeWorkflowValidation(nodes: WfNode[], edges: WfEdge[]): WorkflowValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (nodes.length === 0) {
    errors.push('Adicione pelo menos um estado ao fluxo.')
  }

  const initials = nodes.filter((n) => n.data.isInitial)
  if (initials.length > 1) {
    errors.push('Só pode existir um estado inicial.')
  }
  if (nodes.length > 0 && initials.length === 0) {
    errors.push('Defina exatamente um estado como inicial.')
  }

  const terminals = nodes.filter((n) => n.data.isTerminal)
  if (nodes.length > 0 && terminals.length === 0) {
    errors.push('Defina pelo menos um estado terminal.')
  }

  for (const n of nodes) {
    if (!n.data.label.trim()) {
      errors.push(`Estado sem nome (id: ${n.id.slice(0, 8)}…).`)
    }
  }

  for (const e of edges) {
    if (!e.data?.roles?.length) {
      warnings.push(`Transição “${e.data?.label?.trim() || e.id}” sem papéis permitidos.`)
    }
  }

  if (nodes.length > 1) {
    for (const n of nodes) {
      if (isIsolated(n.id, edges)) {
        warnings.push(`Estado “${n.data.label || n.id}” está isolado (sem ligações).`)
      }
    }
  }

  if (nodes.length > 0 && hasDirectedCycle(nodes, edges)) {
    warnings.push('Existem ciclos; confirme se é intencional.')
  }

  return { errors, warnings }
}
