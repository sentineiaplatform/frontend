import { useReactFlow } from '@xyflow/react'
import { Download, LayoutGrid, Plus, Trash2 } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  serializeWorkflowDraft,
  useWorkflowEditor,
} from '@/pages/dados-mestres/workflows/workflow-editor-store'

export function WorkflowToolbar() {
  const { fitView } = useReactFlow()
  const { state, dispatch } = useWorkflowEditor()

  const exportJson = () => {
    const body = serializeWorkflowDraft(state)
    const blob = new Blob([body], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workflow-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const iconBtn =
    'h-8 w-8 shrink-0 p-0 text-muted-foreground hover:bg-muted hover:text-foreground'

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Button
        type="button"
        size="icon"
        variant="outline"
        className={iconBtn}
        onClick={() => dispatch({ type: 'addNode' })}
        title="Adicionar estado"
        aria-label="Adicionar estado"
      >
        <Plus className="size-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={iconBtn}
        onClick={() => fitView({ padding: 0.12 })}
        title="Ajustar vista"
        aria-label="Ajustar vista ao fluxo"
      >
        <LayoutGrid className="size-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={iconBtn}
        onClick={() => dispatch({ type: 'loadDemo' })}
        title="Carregar exemplo"
        aria-label="Carregar exemplo"
      >
        <span className="text-[10px] font-semibold leading-none">Ex</span>
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={iconBtn}
        onClick={exportJson}
        title="Exportar JSON"
        aria-label="Exportar JSON"
      >
        <Download className="size-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={`${iconBtn} text-destructive/80 hover:text-destructive`}
            title="Limpar diagrama"
            aria-label="Limpar diagrama"
          >
            <Trash2 className="size-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar tudo?</AlertDialogTitle>
            <AlertDialogDescription>Remove estados e ligações. Pode voltar a carregar o exemplo.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => dispatch({ type: 'clearDiagram' })}>
              Limpar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
