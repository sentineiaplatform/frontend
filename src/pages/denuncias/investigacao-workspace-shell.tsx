import { ArrowLeft, CheckIcon, ChevronLeftIcon, ChevronRightIcon, Clock } from 'lucide-react'
import { useEffect, useState, useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { DenunciaMock } from '@/pages/denuncias/denuncias-mock'
import type { WorkflowRuntimeStep } from '@/pages/denuncias/workflow-runtime'

type RailStepCircleState = 'done' | 'doneReviewing' | 'current' | 'workflowAhead' | 'todo'

function StepCircle({
  state,
  index,
}: Readonly<{
  state: RailStepCircleState
  index: number
}>) {
  return (
    <span
      className={cn(
        'relative z-[1] inline-flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-semibold transition-colors',
        (state === 'done' || state === 'doneReviewing') &&
          'border-primary bg-primary text-primary-foreground',
        state === 'doneReviewing' &&
          'ring-2 ring-primary/30 ring-offset-1 ring-offset-background',
        state === 'current' &&
          'border-primary bg-background text-foreground ring-2 ring-primary/25 ring-offset-1 ring-offset-background',
        state === 'workflowAhead' &&
          'border-primary bg-background text-primary shadow-sm ring-1 ring-primary/25 ring-offset-1 ring-offset-background',
        state === 'todo' && 'border-border/80 bg-muted/40 text-muted-foreground',
      )}
      aria-hidden
    >
      {state === 'done' || state === 'doneReviewing' ? (
        <CheckIcon className="size-4" strokeWidth={2.5} />
      ) : state === 'current' ? (
        <span className="bg-primary size-2.5 rounded-full" />
      ) : state === 'workflowAhead' ? (
        <span className="tabular-nums">{index + 1}</span>
      ) : (
        <span className="tabular-nums">{index + 1}</span>
      )}
    </span>
  )
}

/** Um único estado forte «em curso» (ponto): só quando foco = workflow. Etapas já passadas mostram ✓; revisão = ✓+anel; workflow à frente = número contornado (sem segundo ponto). */
function railStepCircleState(
  visualPos: number,
  focusPos: number,
  workflowPos: number,
): RailStepCircleState {
  const wf = workflowPos >= 0
  const focusOk = focusPos >= 0

  if (wf && focusOk && focusPos === workflowPos && visualPos === focusPos) {
    return 'current'
  }

  if (wf && focusOk && focusPos < workflowPos && visualPos === workflowPos) {
    return 'workflowAhead'
  }

  if (wf && focusOk && visualPos === focusPos && visualPos < workflowPos) {
    return 'doneReviewing'
  }

  if (wf && visualPos < workflowPos && visualPos !== focusPos) {
    return 'done'
  }

  if (!focusOk && wf && visualPos === workflowPos) {
    return 'current'
  }

  if (!focusOk && wf && visualPos < workflowPos) {
    return 'done'
  }

  if (focusOk && !wf && visualPos === focusPos) {
    return 'current'
  }

  return 'todo'
}

function tipoEtapaLabel(step: WorkflowRuntimeStep): string {
  if (step.isInitial) return 'Entrada'
  if (step.isTerminal) return 'Terminal'
  return 'Intermediário'
}

function useSlaSnapshot(registradoIso: string, slaHoras: number) {
  return useMemo(() => {
    const start = new Date(registradoIso).getTime()
    const end = start + slaHoras * 3600000
    return { start, end, totalMs: slaHoras * 3600000 }
  }, [registradoIso, slaHoras])
}

function SlaBadge({ registradoEm, slaHoras }: Readonly<{ registradoEm: string; slaHoras: number }>) {
  const { end, totalMs } = useSlaSnapshot(registradoEm, slaHoras)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 60000)
    return () => window.clearInterval(t)
  }, [])
  const left = end - now
  const pctRestante = Math.max(0, Math.min(100, (left / totalMs) * 100))
  const horas = Math.floor(Math.max(0, left) / 3600000)
  const mins = Math.floor((Math.max(0, left) % 3600000) / 60000)
  const atraso = left < 0
  const cor =
    atraso || pctRestante < 15
      ? 'text-destructive'
      : pctRestante < 45
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-emerald-600 dark:text-emerald-500'

  return (
    <div className="flex min-w-0 flex-col gap-1 sm:items-end">
      <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium tabular-nums', cor)}>
        <Clock className="size-3.5 shrink-0" aria-hidden />
        {atraso
          ? `SLA triagem: ${Math.ceil(-left / 3600000)}h em atraso`
          : horas > 0
            ? `${horas}h ${mins}m restantes`
            : `${mins}m restantes`}
      </span>
      <Progress
        value={atraso ? 100 : pctRestante}
        className={cn('h-1 max-w-[11rem]', atraso && '[&_[data-slot=progress-indicator]]:bg-destructive')}
      />
    </div>
  )
}

/** Destino do botão «voltar» no cabeçalho (listagem / Kanban). */
export type InvestigacaoShellVoltar = Readonly<{ href: string; ariaLabel: string }>

export type InvestigacaoWorkspaceShellProps = Readonly<{
  denuncia: DenunciaMock
  steps: WorkflowRuntimeStep[]
  visualFlowOrder: number[]
  /** Posição no rail do passo inferido pelo estado do workflow (para concluídos / âncora). */
  suggestedVisualPos: number
  /** Posição no rail do passo em que o utilizador está a trabalhar. */
  workspaceVisualPos: number
  setWorkspaceStepIndex: (stepIndex: number) => void
  /** Coluna esquerda (ex.: conteúdo original). */
  leftColumn: ReactNode
  /** Esconde a coluna esquerda (ex.: triagem). */
  hideLeftColumn?: boolean
  /** Coluna central (área principal da etapa). */
  centerColumn: ReactNode
  /** Coluna direita (contexto / decisões). */
  rightColumn: ReactNode
  /** Conteúdo fixo (ex.: FAB IA) renderizado após o grid. */
  floatingSlot?: ReactNode
  /** Voltar à listagem ou Kanban (omissão: `/app/denuncias`). */
  voltarPara?: InvestigacaoShellVoltar
}>

export function InvestigacaoWorkspaceShell({
  denuncia,
  steps,
  visualFlowOrder,
  suggestedVisualPos,
  workspaceVisualPos,
  setWorkspaceStepIndex,
  leftColumn,
  hideLeftColumn = false,
  centerColumn,
  rightColumn,
  floatingSlot,
  voltarPara,
}: InvestigacaoWorkspaceShellProps) {
  const voltar = voltarPara ?? {
    href: '/app/denuncias',
    ariaLabel: 'Voltar às denúncias',
  }
  const canPrev = workspaceVisualPos > 0
  const canNext = workspaceVisualPos >= 0 && workspaceVisualPos < visualFlowOrder.length - 1

  const horasDesdeCriacao = (Date.now() - new Date(denuncia.registradoEm).getTime()) / 3600000

  const focusStepIdx =
    workspaceVisualPos >= 0 && workspaceVisualPos < visualFlowOrder.length
      ? visualFlowOrder[workspaceVisualPos]
      : undefined
  const workflowStepIdx =
    suggestedVisualPos >= 0 && suggestedVisualPos < visualFlowOrder.length
      ? visualFlowOrder[suggestedVisualPos]
      : undefined
  const focusStepLabel = focusStepIdx !== undefined ? steps[focusStepIdx]?.label : undefined
  const workflowStepLabel = workflowStepIdx !== undefined ? steps[workflowStepIdx]?.label : undefined
  const mostrarEstadoFluxoSeparado =
    focusStepLabel != null &&
    workflowStepLabel != null &&
    workspaceVisualPos >= 0 &&
    suggestedVisualPos >= 0 &&
    workspaceVisualPos !== suggestedVisualPos

  return (
    <div
      data-investigacao-workspace
      className="flex w-full min-w-0 flex-col gap-4 md:gap-5"
    >
      <header className="border-border/60 bg-background/95 supports-backdrop-filter:backdrop-blur-md sticky top-0 z-40 mt-3 -mx-px shrink-0 rounded-lg border px-3 py-2 shadow-sm sm:mt-4 sm:px-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-1.5 lg:items-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground size-8 shrink-0 -ml-1"
              asChild
            >
              <Link to={voltar.href} aria-label={voltar.ariaLabel}>
                <ArrowLeft className="size-4" aria-hidden />
              </Link>
            </Button>
            <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 gap-y-1">
              <span className="text-foreground font-heading text-base font-semibold tracking-tight sm:text-lg">
                {denuncia.protocolo}
              </span>
            </div>
            <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] sm:text-xs">
              <span>
                {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
                  new Date(denuncia.registradoEm),
                )}
              </span>
              <span>·</span>
              <span>{denuncia.canal}</span>
              <span>·</span>
              <span className="tabular-nums">
                {horasDesdeCriacao < 24 ? `${Math.max(0, Math.round(horasDesdeCriacao))}h` : `${Math.round(horasDesdeCriacao / 24)}d`}{' '}
                desde registo
              </span>
            </div>
            {focusStepLabel ? (
              <div
                className="mt-2 flex min-w-0 flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center"
                role="status"
                aria-live="polite"
              >
                <Badge
                  variant="secondary"
                  className="w-fit max-w-full shrink-0 border border-border/60 bg-muted/50 px-2 py-0.5 text-left text-[11px] font-medium leading-snug text-foreground sm:text-xs"
                >
                  <span className="text-muted-foreground font-normal">Etapa em foco · </span>
                  {focusStepLabel}
                </Badge>
                {mostrarEstadoFluxoSeparado ? (
                  <p className="text-muted-foreground max-w-xl text-[11px] leading-snug sm:text-xs">
                    Estado no fluxo (registo){' '}
                    <span className="text-foreground font-medium">{workflowStepLabel}</span>
                    {' — '}
                    está a rever outra etapa com os botões Anterior / Próxima.
                  </p>
                ) : null}
              </div>
            ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <SlaBadge registradoEm={denuncia.registradoEm} slaHoras={denuncia.slaTriagemHoras} />
            <div className="flex shrink-0 gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1 px-2.5 text-xs"
                disabled={!canPrev}
                onClick={() => {
                  if (canPrev) setWorkspaceStepIndex(visualFlowOrder[workspaceVisualPos - 1]!)
                }}
              >
                <ChevronLeftIcon className="size-3.5 shrink-0" aria-hidden />
                Anterior
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="h-8 gap-1 px-2.5 text-xs"
                disabled={!canNext}
                onClick={() => {
                  if (canNext) setWorkspaceStepIndex(visualFlowOrder[workspaceVisualPos + 1]!)
                }}
              >
                Próxima
                <ChevronRightIcon className="size-3.5 shrink-0" aria-hidden />
              </Button>
            </div>
          </div>
        </div>

        {steps.length > 0 ? (
          <div
            className="border-border/50 mt-2 border-t pt-2"
            role="group"
            aria-label="Etapas do fluxo"
          >
            <div className="-mx-1 overflow-x-auto sm:-mx-0">
              <ol className="flex min-w-[min(100%,520px)] w-full items-start justify-between gap-0 px-0.5 sm:min-w-0">
                {visualFlowOrder.map((stepIdx: number, visualPos: number) => {
                  const step = steps[stepIdx]!
                  const state = railStepCircleState(visualPos, workspaceVisualPos, suggestedVisualPos)
                  const last = visualPos === visualFlowOrder.length - 1
                  const leftSegmentDone =
                    suggestedVisualPos >= 0 && visualPos > 0 && visualPos <= suggestedVisualPos
                  const rightSegmentDone =
                    suggestedVisualPos >= 0 && visualPos < suggestedVisualPos && !last
                  return (
                    <li
                      key={step.nodeId}
                      className="flex min-w-[5.5rem] flex-1 flex-col items-center px-0.5 text-center md:min-w-0"
                    >
                      <div className="flex w-full flex-col items-center px-0.5 pb-1">
                        <div className="flex w-full items-center">
                          <div
                            className={cn(
                              'h-0.5 min-h-px flex-1 rounded-full',
                              visualPos === 0 ? 'pointer-events-none opacity-0' : null,
                              visualPos > 0 && leftSegmentDone ? 'bg-primary' : visualPos > 0 ? 'bg-border' : null,
                            )}
                            aria-hidden
                          />
                          <StepCircle state={state} index={visualPos} />
                          <div
                            className={cn(
                              'h-0.5 min-h-px flex-1 rounded-full',
                              last ? 'pointer-events-none opacity-0' : null,
                              !last && rightSegmentDone ? 'bg-primary' : !last ? 'bg-border' : null,
                            )}
                            aria-hidden
                          />
                        </div>
                        <p
                          className={cn(
                            'mt-1 line-clamp-2 max-w-[7rem] text-[10px] leading-tight font-medium md:max-w-none md:text-[11px]',
                            state === 'current' ||
                            state === 'doneReviewing' ||
                            state === 'workflowAhead'
                              ? 'text-foreground'
                              : 'text-muted-foreground',
                          )}
                        >
                          {step.label}
                        </p>
                        <p className="text-muted-foreground mt-px text-[9px] leading-tight md:text-[10px]">
                          {tipoEtapaLabel(step)}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>
        ) : null}
      </header>

      <div
        className={cn(
          'grid min-w-0 gap-3 pb-24 md:pb-28 xl:items-start xl:gap-4',
          hideLeftColumn
            ? 'xl:grid-cols-[minmax(0,1fr)_minmax(280px,304px)]'
            : 'xl:grid-cols-[minmax(280px,304px)_minmax(0,1fr)_minmax(280px,304px)]',
        )}
      >
        {!hideLeftColumn ? (
          <aside
            className={cn('flex min-w-0 flex-col', 'xl:sticky xl:top-40 xl:self-start')}
            aria-label="Contexto — registo de entrada"
          >
            {leftColumn}
          </aside>
        ) : null}

        <div className="min-w-0 space-y-2">{centerColumn}</div>

        <aside
          className={cn('flex min-w-0 flex-col gap-3', 'xl:sticky xl:top-40 xl:self-start xl:mt-2')}
          aria-label="Painel lateral da etapa"
        >
          {rightColumn}
        </aside>
      </div>

      {floatingSlot}
    </div>
  )
}
