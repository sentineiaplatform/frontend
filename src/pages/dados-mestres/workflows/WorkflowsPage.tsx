/**
 * Workflows de denúncias — mock local (React Flow). Sem API.
 */
import { ReactFlowProvider } from '@xyflow/react'
import { PanelRight } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WorkflowCanvas } from '@/pages/dados-mestres/workflows/components/WorkflowCanvas'
import {
  WorkflowInspector,
  WorkflowInspectorSheetMobile,
} from '@/pages/dados-mestres/workflows/components/WorkflowInspector'
import { WorkflowToolbar } from '@/pages/dados-mestres/workflows/components/WorkflowToolbar'
import { WorkflowValidationPanel } from '@/pages/dados-mestres/workflows/components/WorkflowValidationPanel'
import { createDemoWorkflowGraph } from '@/pages/dados-mestres/workflows/workflow-mocks'
import { computeWorkflowValidation } from '@/pages/dados-mestres/workflows/workflow-validation'
import type { WorkflowEditorState } from '@/pages/dados-mestres/workflows/workflow-editor-store'
import {
  WORKFLOW_DRAFT_STORAGE_KEY,
  WorkflowEditorProvider,
  parseWorkflowDraft,
  serializeWorkflowDraft,
  useWorkflowEditor,
} from '@/pages/dados-mestres/workflows/workflow-editor-store'
import { toast } from 'sonner'

type Hydrate = Pick<WorkflowEditorState, 'nodes' | 'edges' | 'meta'>

function getInitialSnapshot(): Hydrate {
  try {
    const raw = localStorage.getItem(WORKFLOW_DRAFT_STORAGE_KEY)
    if (!raw) {
      const { nodes, edges } = createDemoWorkflowGraph()
      return { nodes, edges, meta: { draftVersion: 1, lastSavedAt: null } }
    }
    const parsed = parseWorkflowDraft(raw)
    if (!parsed) {
      localStorage.removeItem(WORKFLOW_DRAFT_STORAGE_KEY)
      toast.error('Rascunho inválido. Carregámos o exemplo de novo.')
      const { nodes, edges } = createDemoWorkflowGraph()
      return { nodes, edges, meta: { draftVersion: 1, lastSavedAt: null } }
    }
    return { nodes: parsed.nodes, edges: parsed.edges, meta: parsed.meta }
  } catch {
    localStorage.removeItem(WORKFLOW_DRAFT_STORAGE_KEY)
    toast.error('Não foi possível ler o rascunho.')
    const { nodes, edges } = createDemoWorkflowGraph()
    return { nodes, edges, meta: { draftVersion: 1, lastSavedAt: null } }
  }
}

function WorkflowsEditorShell() {
  const { state, dispatch } = useWorkflowEditor()
  const [isNarrow, setIsNarrow] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const fn = () => setIsNarrow(mq.matches)
    fn()
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  useEffect(() => {
    if (!isNarrow) return
    if (state.selectedId) {
      dispatch({ type: 'setUi', patch: { inspectorOpen: true } })
    }
  }, [isNarrow, state.selectedId, dispatch])

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(WORKFLOW_DRAFT_STORAGE_KEY, serializeWorkflowDraft(state))
      } catch {
        toast.message('Não foi possível guardar no navegador.')
      }
    }, 300)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [state.nodes, state.edges, state.meta.draftVersion, state.meta.lastSavedAt])

  const onValidate = useCallback(() => {
    const v = computeWorkflowValidation(state.nodes, state.edges)
    dispatch({ type: 'setValidation', payload: v })
    const n = v.errors.length + v.warnings.length
    toast.message(n ? `${v.errors.length} erro(s), ${v.warnings.length} aviso(s).` : 'Sem problemas.')
  }, [dispatch, state.nodes, state.edges])

  const onPublish = useCallback(() => {
    const v = computeWorkflowValidation(state.nodes, state.edges)
    if (v.errors.length > 0) {
      dispatch({ type: 'setValidation', payload: v })
      toast.error('Corrija os erros antes de publicar.')
      return
    }
    const nextVersion = state.meta.draftVersion + 1
    dispatch({ type: 'publishStart' })
    window.setTimeout(() => {
      dispatch({ type: 'publishSuccess' })
      toast.success(`Versão v${nextVersion} guardada (local).`)
    }, 600)
  }, [dispatch, state.nodes, state.edges, state.meta.draftVersion])

  const empty = state.nodes.length === 0

  return (
    <div className="w-full min-w-0 space-y-3 pb-8">
      <header className="flex flex-wrap items-end justify-between gap-2 border-b border-border/30 pb-2">
        <div>
          <h1 className="text-lg font-medium tracking-tight text-foreground">Workflows</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Canvas ao estilo n8n (grelha de pontos, ligações Bézier). Cada estado tem 4 portas: entrada (esquerda e
            cima), saída (direita e baixo). Com uma <strong className="font-medium text-foreground">ligação</strong>{' '}
            selecionada, arrasta as extremidades para mudar origem ou destino · v{state.meta.draftVersion}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={onValidate}>
            Validar
          </Button>
          <Button type="button" size="sm" className="h-8 px-3 text-xs" disabled={state.ui.isPublishing} onClick={onPublish}>
            {state.ui.isPublishing ? '…' : 'Publicar'}
          </Button>
        </div>
      </header>

      <div className="flex w-full min-w-0 flex-col gap-2 lg:flex-row lg:items-stretch">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <ReactFlowProvider>
            <div className="flex w-full min-w-0 flex-wrap items-center gap-1.5 rounded-2xl border border-zinc-200/80 bg-card/85 px-1.5 py-1 shadow-sm backdrop-blur-sm dark:border-zinc-700/80 dark:bg-zinc-900/60">
              <WorkflowToolbar />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-auto h-8 px-2 text-xs lg:hidden"
                onClick={() => dispatch({ type: 'setUi', patch: { inspectorOpen: true } })}
              >
                <PanelRight className="size-3.5" aria-hidden />
                <span className="sr-only sm:not-sr-only sm:ml-1">Editar</span>
              </Button>
            </div>

            {empty ? (
              <p className="text-xs text-muted-foreground">Diagrama vazio — use + Estado ou Exemplo.</p>
            ) : null}

            <div className="w-full min-w-0 max-w-none -mx-2 md:-mx-3 lg:-mx-4">
              <WorkflowCanvas />
            </div>
          </ReactFlowProvider>
          <WorkflowValidationPanel />
        </div>
        <WorkflowInspector />
      </div>
      <WorkflowInspectorSheetMobile />
    </div>
  )
}

function WorkflowsFailLoad({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex w-full min-h-[40vh] flex-col items-center justify-center gap-4 p-6">
      <Card className="w-full max-w-sm border-border/40 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Erro simulado</CardTitle>
          <CardDescription className="text-xs">
            Remova <code className="rounded bg-muted px-1">?failLoad=1</code> da URL.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" size="sm" onClick={onRetry}>
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function WorkflowsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const failLoad = searchParams.get('failLoad') === '1'
  const [loadFailed, setLoadFailed] = useState(failLoad)

  const initialHydrate = useMemo(() => {
    if (loadFailed) return null
    return getInitialSnapshot()
  }, [loadFailed])

  const onRetryFail = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('failLoad')
      return next
    })
    setLoadFailed(false)
  }, [setSearchParams])

  if (loadFailed) {
    return <WorkflowsFailLoad onRetry={onRetryFail} />
  }

  return (
    <WorkflowEditorProvider
      initialHydrate={
        initialHydrate
          ? {
              nodes: initialHydrate.nodes,
              edges: initialHydrate.edges,
              meta: initialHydrate.meta,
            }
          : null
      }
    >
      <WorkflowsEditorShell />
    </WorkflowEditorProvider>
  )
}
