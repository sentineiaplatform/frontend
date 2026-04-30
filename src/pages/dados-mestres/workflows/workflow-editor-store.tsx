/**
 * Estado local do editor de workflows (mock).
 * Persistência: localStorage opcional — substituir por API quando existir backend.
 */
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  reconnectEdge,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from '@xyflow/react'
import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react'

import { WORKFLOW_STATUS_OPTIONS } from '@/mocks/workflow-status-options'
import { WF_HANDLE } from '@/pages/dados-mestres/workflows/workflow-handles'
import { createDemoWorkflowGraph, type WfEdge, type WfNode } from '@/pages/dados-mestres/workflows/workflow-mocks'

export const WORKFLOW_DRAFT_STORAGE_KEY = 'sentineia_workflow_draft_v1'

export type WorkflowEditorState = {
  nodes: WfNode[]
  edges: WfEdge[]
  selectedId: string | null
  selectionKind: 'node' | 'edge' | null
  validation: { errors: string[]; warnings: string[] }
  ui: {
    inspectorOpen: boolean
    isPublishing: boolean
  }
  meta: {
    draftVersion: number
    lastSavedAt: string | null
  }
}

type WorkflowEditorAction =
  | { type: 'nodesChange'; changes: NodeChange[] }
  | { type: 'edgesChange'; changes: EdgeChange[] }
  | { type: 'connect'; connection: Connection }
  | { type: 'reconnect'; oldEdge: WfEdge; newConnection: Connection }
  | { type: 'selection'; nodeIds: string[]; edgeIds: string[] }
  | { type: 'updateNode'; id: string; patch: Partial<WfNode['data']> }
  | { type: 'updateEdge'; id: string; patch: Partial<NonNullable<WfEdge['data']>> }
  | { type: 'setValidation'; payload: WorkflowEditorState['validation'] }
  | { type: 'setUi'; patch: Partial<WorkflowEditorState['ui']> }
  | { type: 'setMeta'; patch: Partial<WorkflowEditorState['meta']> }
  | { type: 'addNode' }
  | { type: 'loadDemo' }
  | { type: 'clearDiagram' }
  | { type: 'hydrate'; payload: Pick<WorkflowEditorState, 'nodes' | 'edges' | 'meta'> }
  | { type: 'publishSuccess' }
  | { type: 'publishStart' }

const defaultStatusId = WORKFLOW_STATUS_OPTIONS[0]?.id ?? 'st-novo'

export function createInitialWorkflowState(): WorkflowEditorState {
  return {
    nodes: [],
    edges: [],
    selectedId: null,
    selectionKind: null,
    validation: { errors: [], warnings: [] },
    ui: { inspectorOpen: false, isPublishing: false },
    meta: { draftVersion: 1, lastSavedAt: null },
  }
}

function reducer(state: WorkflowEditorState, action: WorkflowEditorAction): WorkflowEditorState {
  switch (action.type) {
    case 'nodesChange':
      return { ...state, nodes: applyNodeChanges(action.changes, state.nodes) as WfNode[] }
    case 'edgesChange':
      return { ...state, edges: applyEdgeChanges(action.changes, state.edges) as WfEdge[] }
    case 'connect': {
      const c = action.connection
      if (!c.source || !c.target) return state
      const edge: WfEdge = {
        id: `e-${c.source}-${c.target}-${crypto.randomUUID().slice(0, 8)}`,
        source: c.source,
        target: c.target,
        sourceHandle: c.sourceHandle ?? undefined,
        targetHandle: c.targetHandle ?? undefined,
        type: 'default',
        label: '',
        data: { label: '', roles: [], requiredFields: [] },
      }
      return { ...state, edges: addEdge(edge, state.edges) as WfEdge[] }
    }
    case 'reconnect': {
      const next = reconnectEdge(action.oldEdge, action.newConnection, state.edges)
      return { ...state, edges: next as WfEdge[] }
    }
    case 'selection': {
      const { nodeIds, edgeIds } = action
      if (nodeIds.length === 1 && edgeIds.length === 0) {
        return { ...state, selectedId: nodeIds[0]!, selectionKind: 'node' }
      }
      if (edgeIds.length === 1 && nodeIds.length === 0) {
        return { ...state, selectedId: edgeIds[0]!, selectionKind: 'edge' }
      }
      return { ...state, selectedId: null, selectionKind: null }
    }
    case 'updateNode': {
      const { id, patch } = action
      let nodes = state.nodes.map((n) => {
        if (n.id !== id) return n
        return { ...n, data: { ...n.data, ...patch } }
      })
      if (patch.isInitial === true) {
        nodes = nodes.map((n) =>
          n.id === id ? n : { ...n, data: { ...n.data, isInitial: false } },
        )
      }
      return { ...state, nodes }
    }
    case 'updateEdge': {
      const { id, patch } = action
      const edges = state.edges.map((e) => {
        if (e.id !== id) return e
        const prevData = e.data ?? { label: '', roles: [], requiredFields: [] }
        const data = { ...prevData, ...patch }
        const label = typeof patch.label === 'string' ? patch.label : (data.label ?? '')
        return { ...e, data, label }
      })
      return { ...state, edges }
    }
    case 'setValidation':
      return { ...state, validation: action.payload }
    case 'setUi':
      return { ...state, ui: { ...state.ui, ...action.patch } }
    case 'setMeta':
      return { ...state, meta: { ...state.meta, ...action.patch } }
    case 'addNode': {
      const i = state.nodes.length
      const id = crypto.randomUUID()
      const isFirst = state.nodes.length === 0
      const newNode: WfNode = {
        id,
        type: 'statusNode',
        position: { x: 100 + i * 40, y: 100 },
        data: {
          label: `Estado ${i + 1}`,
          statusId: defaultStatusId,
          isInitial: isFirst,
          isTerminal: false,
          colorPreset: 'default',
        },
      }
      return {
        ...state,
        nodes: [...state.nodes, newNode],
        selectedId: id,
        selectionKind: 'node',
      }
    }
    case 'loadDemo': {
      const { nodes, edges } = createDemoWorkflowGraph()
      return {
        ...state,
        nodes,
        edges,
        selectedId: null,
        selectionKind: null,
        validation: { errors: [], warnings: [] },
      }
    }
    case 'clearDiagram':
      return {
        ...state,
        nodes: [],
        edges: [],
        selectedId: null,
        selectionKind: null,
        validation: { errors: [], warnings: [] },
      }
    case 'hydrate':
      return {
        ...state,
        nodes: action.payload.nodes,
        edges: action.payload.edges,
        meta: { ...state.meta, ...action.payload.meta },
      }
    case 'publishStart':
      return { ...state, ui: { ...state.ui, isPublishing: true } }
    case 'publishSuccess': {
      const draftVersion = state.meta.draftVersion + 1
      return {
        ...state,
        meta: {
          draftVersion,
          lastSavedAt: new Date().toISOString(),
        },
        ui: { ...state.ui, isPublishing: false },
      }
    }
    default:
      return state
  }
}

const WF_HANDLE_IDS = new Set<string>(Object.values(WF_HANDLE))

function migrateEdgeHandles(edges: WfEdge[]): WfEdge[] {
  return edges.map((e) => ({
    ...e,
    sourceHandle:
      e.sourceHandle != null && WF_HANDLE_IDS.has(e.sourceHandle) ? e.sourceHandle : undefined,
    targetHandle:
      e.targetHandle != null && WF_HANDLE_IDS.has(e.targetHandle) ? e.targetHandle : undefined,
  }))
}

export function parseWorkflowDraft(raw: string): Pick<WorkflowEditorState, 'nodes' | 'edges' | 'meta'> | null {
  try {
    const o = JSON.parse(raw) as unknown
    if (!o || typeof o !== 'object') return null
    const rec = o as Record<string, unknown>
    if (!Array.isArray(rec.nodes) || !Array.isArray(rec.edges)) return null
    const meta = rec.meta as Record<string, unknown> | undefined
    const edges = migrateEdgeHandles(rec.edges as WfEdge[])
    return {
      nodes: rec.nodes as WfNode[],
      edges,
      meta: {
        draftVersion: typeof meta?.draftVersion === 'number' ? meta.draftVersion : 1,
        lastSavedAt: typeof meta?.lastSavedAt === 'string' ? meta.lastSavedAt : null,
      },
    }
  } catch {
    return null
  }
}

export function serializeWorkflowDraft(state: WorkflowEditorState): string {
  return JSON.stringify({
    nodes: state.nodes,
    edges: state.edges,
    meta: state.meta,
  })
}

type Ctx = {
  state: WorkflowEditorState
  dispatch: React.Dispatch<WorkflowEditorAction>
}

const WorkflowEditorContext = createContext<Ctx | null>(null)

export function WorkflowEditorProvider({
  children,
  initialHydrate,
}: {
  children: ReactNode
  initialHydrate?: Pick<WorkflowEditorState, 'nodes' | 'edges' | 'meta'> | null
}) {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const base = createInitialWorkflowState()
    if (!initialHydrate) return base
    return {
      ...base,
      nodes: initialHydrate.nodes,
      edges: initialHydrate.edges,
      meta: { ...base.meta, ...initialHydrate.meta },
    }
  })

  const value = useMemo(() => ({ state, dispatch }), [state])

  return <WorkflowEditorContext.Provider value={value}>{children}</WorkflowEditorContext.Provider>
}

export function useWorkflowEditor() {
  const ctx = useContext(WorkflowEditorContext)
  if (!ctx) throw new Error('useWorkflowEditor outside WorkflowEditorProvider')
  return ctx
}
