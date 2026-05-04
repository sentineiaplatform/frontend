/**
 * Mocks do editor de workflows (denúncias) — substituir por API/hooks quando existir backend.
 * @see WorkflowsPage.tsx
 */
import type { Edge, Node } from '@xyflow/react'

import { WORKFLOW_STATUS_OPTIONS } from '@/mocks/workflow-status-options'
import { WF_HANDLE } from '@/pages/dados-mestres/workflows/workflow-handles'

export type WorkflowRoleId = 'ADMIN' | 'TRIADOR' | 'INVESTIGADOR' | 'LEITURA'

export const WORKFLOW_ROLE_OPTIONS: readonly {
  readonly id: WorkflowRoleId
  readonly label: string
}[] = [
  { id: 'ADMIN', label: 'Administrador' },
  { id: 'TRIADOR', label: 'Triador' },
  { id: 'INVESTIGADOR', label: 'Investigador' },
  { id: 'LEITURA', label: 'Leitura' },
] as const

export type WorkflowRequiredFieldKey =
  | 'MOTIVO_ENCERRAMENTO'
  | 'RESUMO'
  | 'ANEXO_OPCIONAL'

export const WORKFLOW_REQUIRED_FIELD_OPTIONS: readonly {
  readonly id: WorkflowRequiredFieldKey
  readonly label: string
}[] = [
  { id: 'MOTIVO_ENCERRAMENTO', label: 'Motivo de encerramento' },
  { id: 'RESUMO', label: 'Resumo' },
  { id: 'ANEXO_OPCIONAL', label: 'Anexo (opcional)' },
] as const

export type StatusNodeData = {
  label: string
  statusId: string
  isInitial: boolean
  isTerminal: boolean
  colorPreset?: 'default' | 'blue' | 'amber' | 'rose'
}

export type TransitionEdgeData = {
  label: string
  roles: WorkflowRoleId[]
  requiredFields: WorkflowRequiredFieldKey[]
}

export type WfNode = Node<StatusNodeData, 'statusNode'>
export type WfEdge = Edge<TransitionEdgeData>

/** Grafo de demonstração (3 nós + transições) — Triagem é o passo inicial (receção integrada). */
export function createDemoWorkflowGraph(): { nodes: WfNode[]; edges: WfEdge[] } {
  const b = WORKFLOW_STATUS_OPTIONS[1]!
  const c = WORKFLOW_STATUS_OPTIONS[2]!
  const d = WORKFLOW_STATUS_OPTIONS[4]!
  const n2: WfNode = {
    id: 'demo-n2',
    type: 'statusNode',
    position: { x: 40, y: 200 },
    data: {
      label: 'Triagem',
      statusId: b.id,
      isInitial: true,
      isTerminal: false,
      colorPreset: 'blue',
    },
  }
  const n3: WfNode = {
    id: 'demo-n3',
    type: 'statusNode',
    position: { x: 280, y: 200 },
    data: {
      label: 'Investigação',
      statusId: c.id,
      isInitial: false,
      isTerminal: false,
      colorPreset: 'amber',
    },
  }
  const n4: WfNode = {
    id: 'demo-n4',
    type: 'statusNode',
    position: { x: 520, y: 200 },
    data: {
      label: 'Encerramento',
      statusId: d.id,
      isInitial: false,
      isTerminal: true,
      colorPreset: 'rose',
    },
  }
  const e1: WfEdge = {
    id: 'demo-e1',
    source: n2.id,
    target: n3.id,
    sourceHandle: WF_HANDLE.outR,
    targetHandle: WF_HANDLE.inL,
    type: 'default',
    label: 'Investigar',
    data: {
      label: 'Investigar',
      roles: ['ADMIN', 'INVESTIGADOR'],
      requiredFields: ['RESUMO'],
    },
  }
  const e2: WfEdge = {
    id: 'demo-e2',
    source: n2.id,
    target: n4.id,
    sourceHandle: WF_HANDLE.outB,
    targetHandle: WF_HANDLE.inT,
    type: 'default',
    label: 'Encerrar direto',
    data: {
      label: 'Encerrar direto',
      roles: ['TRIADOR'],
      requiredFields: ['MOTIVO_ENCERRAMENTO', 'RESUMO'],
    },
  }
  const e3: WfEdge = {
    id: 'demo-e3',
    source: n3.id,
    target: n4.id,
    sourceHandle: WF_HANDLE.outR,
    targetHandle: WF_HANDLE.inL,
    type: 'default',
    label: 'Concluir',
    data: {
      label: 'Concluir',
      roles: ['INVESTIGADOR'],
      requiredFields: ['RESUMO', 'ANEXO_OPCIONAL'],
    },
  }
  return { nodes: [n2, n3, n4], edges: [e1, e2, e3] }
}
