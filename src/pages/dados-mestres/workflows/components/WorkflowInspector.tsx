import { useEffect, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { WORKFLOW_STATUS_OPTIONS } from '@/mocks/workflow-status-options'
import {
  WORKFLOW_REQUIRED_FIELD_OPTIONS,
  WORKFLOW_ROLE_OPTIONS,
  type StatusNodeData,
  type WorkflowRequiredFieldKey,
  type WorkflowRoleId,
} from '@/pages/dados-mestres/workflows/workflow-mocks'
import { useWorkflowEditor } from '@/pages/dados-mestres/workflows/workflow-editor-store'
import { cn } from '@/lib/utils'

function useIsMdUp() {
  const [ok, setOk] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const fn = () => setOk(mq.matches)
    fn()
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return ok
}

function InspectorBody({ className }: { className?: string }) {
  const { state, dispatch } = useWorkflowEditor()
  const { selectedId, selectionKind } = state

  const node = selectionKind === 'node' ? state.nodes.find((n) => n.id === selectedId) : undefined
  const edge = selectionKind === 'edge' ? state.edges.find((e) => e.id === selectedId) : undefined

  if (!node && !edge) {
    return (
      <div className={cn('p-3 text-xs leading-relaxed text-muted-foreground', className)}>
        Clique num estado ou numa ligação no diagrama.
      </div>
    )
  }

  if (node) {
    const d = node.data
    return (
      <div className={cn('flex flex-col gap-3 p-3', className)}>
        <div className="space-y-2">
          <Label htmlFor="wf-node-label">Nome exibido</Label>
          <Input
            id="wf-node-label"
            value={d.label}
            onChange={(e) => dispatch({ type: 'updateNode', id: node.id, patch: { label: e.target.value } })}
          />
        </div>
        <div className="space-y-2">
          <Label>Status (catálogo mock)</Label>
          <Select
            value={d.statusId}
            onValueChange={(v) => dispatch({ type: 'updateNode', id: node.id, patch: { statusId: v } })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Escolher status" />
            </SelectTrigger>
            <SelectContent>
              {WORKFLOW_STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="wf-initial">Inicial</Label>
          <Switch
            id="wf-initial"
            checked={d.isInitial}
            onCheckedChange={(checked) =>
              dispatch({ type: 'updateNode', id: node.id, patch: { isInitial: Boolean(checked) } })
            }
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="wf-terminal">Terminal</Label>
          <Switch
            id="wf-terminal"
            checked={d.isTerminal}
            onCheckedChange={(checked) =>
              dispatch({ type: 'updateNode', id: node.id, patch: { isTerminal: Boolean(checked) } })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Cor (preset)</Label>
          <Select
            value={d.colorPreset ?? 'default'}
            onValueChange={(v) =>
              dispatch({
                type: 'updateNode',
                id: node.id,
                patch: { colorPreset: v as StatusNodeData['colorPreset'] },
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Neutro</SelectItem>
              <SelectItem value="blue">Azul</SelectItem>
              <SelectItem value="amber">Âmbar</SelectItem>
              <SelectItem value="rose">Rosa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  }

  const ed = edge!
  const data = ed.data ?? { label: '', roles: [], requiredFields: [] }
  const roles = data.roles ?? []
  const fields = data.requiredFields ?? []

  const toggleRole = (id: WorkflowRoleId) => {
    const next = roles.includes(id) ? roles.filter((r) => r !== id) : [...roles, id]
    dispatch({ type: 'updateEdge', id: ed.id, patch: { roles: next } })
  }

  const toggleField = (id: WorkflowRequiredFieldKey) => {
    const next = fields.includes(id) ? fields.filter((f) => f !== id) : [...fields, id]
    dispatch({ type: 'updateEdge', id: ed.id, patch: { requiredFields: next } })
  }

  return (
    <div className={cn('flex flex-col gap-3 p-3', className)}>
      <div className="space-y-2">
        <Label htmlFor="wf-edge-label">Rótulo da transição</Label>
        <Input
          id="wf-edge-label"
          value={data.label}
          onChange={(e) => dispatch({ type: 'updateEdge', id: ed.id, patch: { label: e.target.value } })}
        />
      </div>
      <div className="space-y-2">
        <span className="text-sm font-medium">Papéis permitidos</span>
        <div className="flex flex-col gap-2">
          {WORKFLOW_ROLE_OPTIONS.map((r) => (
            <label key={r.id} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox checked={roles.includes(r.id)} onCheckedChange={() => toggleRole(r.id)} />
              {r.label}
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <span className="text-sm font-medium">Campos obrigatórios</span>
        <div className="flex flex-col gap-2">
          {WORKFLOW_REQUIRED_FIELD_OPTIONS.map((f) => (
            <label key={f.id} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox checked={fields.includes(f.id)} onCheckedChange={() => toggleField(f.id)} />
              {f.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

export function WorkflowInspectorSheetMobile() {
  const isMd = useIsMdUp()
  const { state, dispatch } = useWorkflowEditor()
  if (isMd) return null
  return (
    <Sheet
      open={state.ui.inspectorOpen}
      onOpenChange={(open) => dispatch({ type: 'setUi', patch: { inspectorOpen: open } })}
    >
      <SheetContent side="right" className="flex w-full max-w-[18rem] flex-col border-l border-border/30 p-0 sm:max-w-[18rem]">
        <SheetHeader className="border-b border-border/30 px-3 py-2.5 text-left">
          <SheetTitle className="text-sm font-medium">Detalhe</SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <InspectorBody />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function WorkflowInspector() {
  const isMd = useIsMdUp()

  if (!isMd) return null

  return (
    <aside
      className="flex w-[min(100%,18rem)] shrink-0 flex-col border-l border-border/30 bg-background lg:w-72"
      aria-label="Detalhe da seleção"
    >
      <div className="border-b border-border/30 px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Detalhe
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <InspectorBody />
      </div>
    </aside>
  )
}

