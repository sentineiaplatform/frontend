import { AlertCircle, ChevronDown, Info } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { useWorkflowEditor } from '@/pages/dados-mestres/workflows/workflow-editor-store'

export function WorkflowValidationPanel() {
  const { state } = useWorkflowEditor()
  const [open, setOpen] = useState(false)
  const { errors, warnings } = state.validation
  const total = errors.length + warnings.length

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-t border-border/20">
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-full justify-between rounded-none px-2 text-xs font-normal text-muted-foreground hover:text-foreground"
        >
          <span>Validação {total > 0 ? `(${total})` : ''}</span>
          <ChevronDown className={cn('size-3.5 shrink-0 opacity-60 transition-transform', open && 'rotate-180')} aria-hidden />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden">
        <div className="max-h-36 space-y-1.5 overflow-y-auto px-2 pb-2 pt-0 text-xs">
          {errors.length === 0 && warnings.length === 0 ? (
            <p className="text-muted-foreground">Use Validar no topo.</p>
          ) : null}
          {errors.map((e) => (
            <div key={e} className="flex gap-1.5 text-destructive">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span>{e}</span>
            </div>
          ))}
          {warnings.map((w) => (
            <div key={w} className="flex gap-1.5 text-amber-700 dark:text-amber-400/90">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span>{w}</span>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
