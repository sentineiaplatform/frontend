import {
  Building2,
  ClipboardListIcon,
  Globe,
  Mail,
  MessageSquare,
  PaperclipIcon,
  Phone,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'
import {
  DENUNCIA_PRIORIDADE_FORM,
  DENUNCIA_STATUS_FORM,
  type DenunciaMock,
  type DenunciaPrioridade,
  type DenunciaStatus,
} from '@/pages/denuncias/denuncias-mock'
import { fetchComplaintByProtocol } from '@/services/complaint-service'
import { findOrCreateInvestigation, type InvestigationDto } from '@/services/investigation-service'
import { InvestigacaoPainelConteudoOriginal } from '@/pages/denuncias/investigacao-painel-conteudo-original'
import {
  InvestigacaoRecepcaoView,
  isRececaoWorkspaceStep,
} from '@/pages/denuncias/investigacao-recepcao-view'
import {
  canonicalInvestigacaoPhase,
  isTriagemWorkspaceStep,
} from '@/pages/denuncias/investigacao-workspace-canonical'
import {
  InvestigacaoEtapasCenterColumn,
  InvestigacaoEtapasRightColumn,
} from '@/pages/denuncias/investigacao-workspace-etapas'
import {
  InvestigacaoWorkspaceShell,
  type InvestigacaoShellVoltar,
} from '@/pages/denuncias/investigacao-workspace-shell'
import {
  computeInvestigationRailStepOrder,
  filterInvestigationRailPlaceholderSteps,
  railSnapStepIndex,
} from '@/pages/denuncias/investigacao-workflow-rail-order'
import {
  buildOrderedWorkflowSteps,
  computeVisualFlowStepOrder,
  inferInitialWorkflowStepIndex,
  loadWorkflowRuntimeGraph,
  outgoingTransitionsFromStep,
} from '@/pages/denuncias/workflow-runtime'

function formatoData(iso: string) {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function iconeCanalDenuncia(canal: string): LucideIcon {
  const c = canal.toLowerCase()
  if (c.includes('web')) return Globe
  if (c.includes('telefone')) return Phone
  if (c.includes('presencial')) return Building2
  if (c.includes('e-mail') || c.includes('mail')) return Mail
  return MessageSquare
}

function prioridadeResumoClass(p: DenunciaPrioridade) {
  switch (p) {
    case 'P1':
      return 'bg-rose-50 text-rose-900 dark:bg-rose-950/80 dark:text-rose-100'
    case 'P2':
      return 'bg-amber-50 text-amber-950 dark:bg-amber-950/70 dark:text-amber-50'
    default:
      return 'bg-muted/90 text-muted-foreground'
  }
}

function statusResumoClass(status: DenunciaStatus) {
  switch (status) {
    case 'aberta':
      return 'border-transparent bg-sky-50/95 text-sky-950 dark:bg-sky-950/65 dark:text-sky-50'
    case 'em_analise':
      return 'border-transparent bg-amber-50/95 text-amber-950 dark:bg-amber-950/65 dark:text-amber-50'
    case 'encerrada':
      return 'border-transparent bg-muted text-muted-foreground'
    default:
      return ''
  }
}

function CampoResumoDenuncia({ rotulo, children }: Readonly<{ rotulo: string; children: ReactNode }>) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wide">{rotulo}</p>
      <div className="text-foreground text-sm leading-snug">{children}</div>
    </div>
  )
}

/** Mesmos dados relevantes da tabela / Kanban de denúncias, para avaliação nas fases do fluxo. */
function ResumoDenunciaInvestigacao({
  denuncia,
  className,
}: Readonly<{ denuncia: DenunciaMock; className?: string }>) {
  const CanalIcon = iconeCanalDenuncia(denuncia.canal)
  const statusLabel = DENUNCIA_STATUS_FORM.find((s) => s.value === denuncia.status)?.label ?? denuncia.status
  const prioridadeLabel =
    DENUNCIA_PRIORIDADE_FORM.find((p) => p.value === denuncia.prioridade)?.label ?? denuncia.prioridade
  const qAnexos = denuncia.evidencias.length

  return (
    <div
      id="investigacao-detalhes-denuncia"
      className={cn(
        'scroll-mt-4 overflow-hidden rounded-lg border border-border/60 bg-muted/10',
        className,
      )}
    >
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="detalhes" className="border-b-0">
          <AccordionTrigger
            className="hover:bg-muted/35 cursor-pointer items-center gap-3 rounded-none border-0 px-3 py-3 hover:no-underline sm:px-4"
            expandActionLabel="Expandir detalhes"
            collapseActionLabel="Recolher"
          >
            <span className="bg-muted/65 ring-border/45 inline-flex size-9 shrink-0 items-center justify-center rounded-md ring-1">
              <ClipboardListIcon className="text-muted-foreground size-4" aria-hidden strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="text-foreground block text-sm font-semibold tracking-tight">
                Detalhes da denúncia
              </span>
              <span className="text-muted-foreground mt-0.5 block text-xs leading-snug">
                {denuncia.protocolo}
                <span className="text-muted-foreground/80">
                  {' '}
                  · {qAnexos === 0 ? 'sem anexos' : `${qAnexos} anexo${qAnexos === 1 ? '' : 's'}`} · campos como na
                  listagem
                </span>
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="border-border/40 border-t px-0 pb-0">
            <div className="space-y-4 px-3 pt-4 pb-4 sm:px-4">
              <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
                Resumo{' '}
                <span className="font-normal normal-case text-muted-foreground/80">(como na listagem)</span>
              </p>
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <CampoResumoDenuncia rotulo="Status">
          <span
            className={cn(
              'inline-flex h-7 max-w-full items-center rounded-full border px-2.5 text-xs font-medium',
              statusResumoClass(denuncia.status),
            )}
          >
            {statusLabel}
          </span>
        </CampoResumoDenuncia>
        <CampoResumoDenuncia rotulo="Prioridade">
          <span
            className={cn(
              'inline-flex min-h-7 max-w-full items-center rounded-md border border-transparent px-2 py-0.5 text-xs font-semibold leading-snug',
              prioridadeResumoClass(denuncia.prioridade),
            )}
          >
            {prioridadeLabel}
          </span>
        </CampoResumoDenuncia>
        <CampoResumoDenuncia rotulo="Registrado em">
          <span className="tabular-nums text-muted-foreground">{formatoData(denuncia.registradoEm)}</span>
        </CampoResumoDenuncia>
        <CampoResumoDenuncia rotulo="Atualizado">
          <span className="tabular-nums text-muted-foreground">{formatoData(denuncia.atualizadoEm)}</span>
        </CampoResumoDenuncia>
        <CampoResumoDenuncia rotulo="Categoria">
          <span className="font-medium">{denuncia.categoria}</span>
        </CampoResumoDenuncia>
        <CampoResumoDenuncia rotulo="Canal">
          <span className="text-muted-foreground inline-flex items-start gap-2">
            <span className="bg-muted/60 text-muted-foreground mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md ring-1 ring-border/40">
              <CanalIcon className="size-3.5 shrink-0" aria-hidden strokeWidth={1.75} />
            </span>
            <span className="min-w-0 pt-1">{denuncia.canal}</span>
          </span>
        </CampoResumoDenuncia>
        <CampoResumoDenuncia rotulo="Departamento">
          {denuncia.departamento}
        </CampoResumoDenuncia>
        <CampoResumoDenuncia rotulo="Título">
          <span className="text-foreground">{denuncia.titulo}</span>
        </CampoResumoDenuncia>
        <CampoResumoDenuncia rotulo="Anonimato">
          <span className="text-muted-foreground">
            {denuncia.anonimato === 'anonimo' ? 'Anônimo' : 'Identificado'}
          </span>
        </CampoResumoDenuncia>
      </div>

      <div className="border-border/40 mt-4 border-t pt-4">
        <p className="text-muted-foreground mb-2 text-[11px] font-semibold uppercase tracking-wide">
          Evidências anexadas pelo denunciante
        </p>
        {denuncia.evidencias.length === 0 ? (
          <p className="text-muted-foreground text-sm leading-relaxed">
            Nenhum ficheiro anexado no registo inicial desta denúncia.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {denuncia.evidencias.map((ev) => (
              <li
                key={ev.id}
                className="border-border/50 bg-background/90 flex flex-wrap items-center gap-2 rounded-md border px-2.5 py-2 sm:gap-3 sm:px-3"
              >
                <PaperclipIcon
                  className="text-muted-foreground size-4 shrink-0"
                  aria-hidden
                  strokeWidth={1.75}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-sm font-medium leading-tight">{ev.nome}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs tabular-nums">
                    {ev.tamanho}
                    <span className="text-muted-foreground/70 mx-1.5">·</span>
                    enviado em {formatoData(ev.enviadoEm)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-8 shrink-0 px-2 text-xs"
                  onClick={() =>
                    toast.message('Visualização simulada', {
                      description: `Anexo: ${ev.nome} (${ev.tamanho}). Integração com armazenamento em breve.`,
                    })
                  }
                >
                  Abrir
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

/** Área de trabalho da denúncia: etapas derivadas do fluxo em Dados mestres → Workflows (mock local). */
type DenunciasInvestigacaoState = { denunciasVista?: 'tabela' | 'kanban' }

export function DenunciaInvestigacaoPage() {
  const { protocolo: protocoloParam } = useParams<{ protocolo: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [graphTick, setGraphTick] = useState(0)

  const voltarPara = useMemo<InvestigacaoShellVoltar>(() => {
    const v = (location.state as DenunciasInvestigacaoState | null)?.denunciasVista
    return {
      href: '/app/denuncias',
      ariaLabel:
        v === 'kanban' ? 'Voltar ao quadro Kanban' : 'Voltar à listagem de denúncias',
    }
  }, [location.state])

  const protocoloDecoded = protocoloParam ? decodeURIComponent(protocoloParam) : ''

  const [denuncia, setDenuncia] = useState<DenunciaMock | undefined>(undefined)
  const [carregandoDenuncia, setCarregandoDenuncia] = useState(true)
  const [investigation, setInvestigation] = useState<InvestigationDto | null>(null)

  useEffect(() => {
    if (!protocoloDecoded) {
      navigate('/app/denuncias', { replace: true })
      return
    }
    let cancelado = false
    setCarregandoDenuncia(true)
    fetchComplaintByProtocol(protocoloDecoded)
      .then(async (d) => {
        if (cancelado) return
        setDenuncia(d)
        setCarregandoDenuncia(false)
        try {
          const inv = await findOrCreateInvestigation(d.id)
          if (!cancelado) setInvestigation(inv)
        } catch {
          // falha não-fatal: investigação será null
        }
      })
      .catch((err: unknown) => {
        if (cancelado) return
        setCarregandoDenuncia(false)
        const msg = err instanceof Error ? err.message : ''
        toast.error(msg === 'not_found' ? 'Denúncia não encontrada.' : 'Erro ao carregar denúncia.')
        navigate('/app/denuncias', { replace: true })
      })
    return () => { cancelado = true }
  }, [protocoloDecoded, navigate])

  useEffect(() => {
    const bump = () => setGraphTick((n) => n + 1)
    window.addEventListener('focus', bump)
    window.addEventListener('storage', bump)
    return () => {
      window.removeEventListener('focus', bump)
      window.removeEventListener('storage', bump)
    }
  }, [])

  const { steps, initialWorkspaceIdx, nodes, edges } = useMemo(() => {
    const { nodes: n, edges: e } = loadWorkflowRuntimeGraph()
    const s = buildOrderedWorkflowSteps(n, e)
    /** Simulação local: `status` na listagem é só ilustrativo — entrada na área de trabalho é sempre a etapa inicial do fluxo. */
    const idx = inferInitialWorkflowStepIndex(s)
    return {
      steps: s,
      initialWorkspaceIdx: idx,
      nodes: n,
      edges: e,
    }
  }, [graphTick])

  const fullRailOrder = useMemo(() => {
    const canvasOrder = computeVisualFlowStepOrder(steps, nodes)
    return computeInvestigationRailStepOrder(steps, canvasOrder)
  }, [steps, nodes])

  const visualFlowOrder = useMemo(
    () => filterInvestigationRailPlaceholderSteps(fullRailOrder, steps),
    [fullRailOrder, steps],
  )

  const [workspaceStepIndex, setWorkspaceStepIndex] = useState(0)

  useEffect(() => {
    setWorkspaceStepIndex(initialWorkspaceIdx)
  }, [initialWorkspaceIdx, protocoloDecoded])

  useEffect(() => {
    if (steps.length === 0) return
    setWorkspaceStepIndex((i) => Math.min(Math.max(i, 0), steps.length - 1))
  }, [steps.length])

  const workspaceIdx = steps.length > 0 ? Math.min(workspaceStepIndex, steps.length - 1) : 0

  useEffect(() => {
    if (visualFlowOrder.length === 0 || fullRailOrder.length === 0) return
    if (visualFlowOrder.includes(workspaceIdx)) return
    setWorkspaceStepIndex(railSnapStepIndex(visualFlowOrder, fullRailOrder, workspaceIdx))
  }, [visualFlowOrder, fullRailOrder, workspaceIdx])

  const workspaceVisualPos =
    visualFlowOrder.length > 0 ? visualFlowOrder.indexOf(workspaceIdx) : -1
  /** Simulação: progresso no rail = etapa em foco (Anterior/Próximo), não o estado mock na BD. */
  const suggestedVisualPos = workspaceVisualPos

  const { workspaceStep, transitions } = useMemo(() => {
    const cur = steps[workspaceIdx]
    const tr = cur != null ? outgoingTransitionsFromStep(cur.nodeId, edges, nodes) : []
    return { workspaceStep: cur, transitions: tr }
  }, [steps, workspaceIdx, edges, nodes])

  const phase = canonicalInvestigacaoPhase(workspaceStep)
  const modoRecepcaoCompleto =
    steps.length > 0 && (isRececaoWorkspaceStep(workspaceStep) || isTriagemWorkspaceStep(workspaceStep))

  if (carregandoDenuncia || !denuncia) {
    return (
      <div className="flex items-center justify-center px-4 py-16">
        <Spinner className="size-6 text-muted-foreground/50" />
      </div>
    )
  }

  if (modoRecepcaoCompleto) {
    return (
      <div
        data-rececao-workspace
        data-investigacao-workspace
        className="flex w-full min-w-0 flex-col gap-4 pb-8"
      >
        <InvestigacaoRecepcaoView
          denuncia={denuncia}
          phase={phase}
          investigation={investigation}
          steps={steps}
          visualFlowOrder={visualFlowOrder}
          suggestedVisualPos={suggestedVisualPos}
          workspaceVisualPos={workspaceVisualPos}
          setWorkspaceStepIndex={setWorkspaceStepIndex}
          voltarPara={voltarPara}
        />
      </div>
    )
  }

  return (
    <div
      data-investigacao-workspace
      className="flex w-full min-w-0 flex-col gap-4 pb-8"
    >
      {steps.length === 0 ? (
        <>
          <div className="min-w-0 space-y-1 pt-3">
            <h1
              id="investigacao-protocolo-heading"
              className="text-foreground font-heading text-balance text-2xl font-semibold tracking-tight md:text-3xl"
            >
              {denuncia.protocolo}
            </h1>
            <p className="text-muted-foreground max-w-2xl pt-0.5 text-sm leading-relaxed">
              {denuncia.categoria} · {denuncia.departamento}
            </p>
          </div>
          <ResumoDenunciaInvestigacao denuncia={denuncia} />
          <p className="text-muted-foreground text-center text-sm">
            Sem estados no fluxo. Configure em{' '}
            <Link className="text-primary underline-offset-2 hover:underline" to="/app/dados-mestres/workflows">
              Workflows
            </Link>
            .
          </p>
        </>
      ) : (
        <>
          <InvestigacaoWorkspaceShell
            denuncia={denuncia}
            steps={steps}
            visualFlowOrder={visualFlowOrder}
            suggestedVisualPos={suggestedVisualPos}
            workspaceVisualPos={workspaceVisualPos}
            setWorkspaceStepIndex={setWorkspaceStepIndex}
            voltarPara={voltarPara}
            leftColumn={<InvestigacaoPainelConteudoOriginal denuncia={denuncia} />}
            centerColumn={
              <>
                <InvestigacaoEtapasCenterColumn
                  phase={phase}
                  denuncia={denuncia}
                  workspaceStep={workspaceStep}
                  transitions={transitions}
                />
              </>
            }
            rightColumn={<InvestigacaoEtapasRightColumn phase={phase} />}
          />
        </>
      )}
    </div>
  )
}
