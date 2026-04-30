import { Handle, Position, type NodeProps } from '@xyflow/react'

import { cn } from '@/lib/utils'
import type { StatusNodeData } from '@/pages/dados-mestres/workflows/workflow-mocks'
import { WF_HANDLE } from '@/pages/dados-mestres/workflows/workflow-handles'

const accentBar: Record<NonNullable<StatusNodeData['colorPreset']>, string> = {
  default: 'bg-zinc-400 dark:bg-zinc-500',
  blue: 'bg-blue-500 dark:bg-blue-400',
  amber: 'bg-amber-500 dark:bg-amber-400',
  rose: 'bg-rose-500 dark:bg-rose-400',
}

/** Círculos n8n: branco + bordo neutro, ~24px hit via pseudo (after) */
const wfHandle =
  'wf-h !size-[11px] !min-h-[11px] !min-w-[11px] !rounded-full !border-2 !border-zinc-300 !bg-white !shadow-sm dark:!border-zinc-600 dark:!bg-zinc-900 after:absolute after:inset-[-12px] after:content-[""]'

export function StatusNode({ data, selected }: NodeProps) {
  const d = data as StatusNodeData
  const preset = d.colorPreset ?? 'default'

  return (
    <div
      className={cn(
        'wf-n8n-node flex min-w-[168px] max-w-[220px] overflow-hidden rounded-2xl border text-left shadow-sm transition-shadow',
        'border-zinc-200/90 bg-white dark:border-zinc-700/90 dark:bg-zinc-900/95',
        selected
          ? 'ring-2 ring-primary/45 shadow-lg ring-offset-2 ring-offset-[var(--wf-n8n-canvas)]'
          : 'shadow-[0_2px_12px_oklch(0.2_0.03_264/0.06)] hover:shadow-[0_6px_22px_oklch(0.2_0.03_264/0.09)]',
      )}
    >
      <div className={cn('w-1 shrink-0', accentBar[preset])} aria-hidden />
      <div className="relative min-w-0 flex-1 px-3 py-2.5">
        <Handle type="target" position={Position.Left} id={WF_HANDLE.inL} className={wfHandle} />
        <Handle type="source" position={Position.Right} id={WF_HANDLE.outR} className={wfHandle} />
        <Handle type="target" position={Position.Top} id={WF_HANDLE.inT} className={wfHandle} />
        <Handle type="source" position={Position.Bottom} id={WF_HANDLE.outB} className={wfHandle} />

        <div className="space-y-1.5">
          <div className="truncate text-[13px] font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50">
            {d.label || 'Estado'}
          </div>
          <div className="flex flex-wrap gap-1">
            {d.isInitial ? (
              <span className="rounded-md bg-primary/14 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                Inicial
              </span>
            ) : null}
            {d.isTerminal ? (
              <span className="rounded-md border border-zinc-200/80 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-400">
                Terminal
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
