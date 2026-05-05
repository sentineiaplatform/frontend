import {
  AlertCircle,
  ArrowRightLeft,
  Building2,
  Bot,
  Check,
  ClipboardCheck,
  FileCheck2,
  FileSearch,
  FileText,
  GitBranch,
  GitCompare,
  History,
  Link2,
  MessageCircleQuestion,
  MessageSquare,
  PenLine,
  Scale,
  SendHorizontal,
  Sparkles,
  UserPlus,
  UserRound,
  Users,
  X,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { DenunciaMock } from '@/pages/denuncias/denuncias-mock'
import {
  addComment,
  deleteInvolved,
  listComments,
  listInvolved,
  updateInvestigation,
  type InvestigationDto,
} from '@/services/investigation-service'
import {
  createLink,
  deleteLink,
  listLinks,
  LINK_TYPE_LABEL,
  type ComplaintLinkDto,
} from '@/services/complaint-link-service'
import { fetchUsersList, type UserListItemDto } from '@/services/user-profile-service'
import { InvestigacaoPainelConteudoOriginal } from '@/pages/denuncias/investigacao-painel-conteudo-original'
import { InvestigacaoWorkspaceSecao } from '@/pages/denuncias/investigacao-workspace-secao'
import {
  InvestigacaoWorkspaceShell,
  type InvestigacaoShellVoltar,
} from '@/pages/denuncias/investigacao-workspace-shell'
import type { CanonicalInvestigacaoPhase } from '@/pages/denuncias/investigacao-workspace-canonical'
import type { WorkflowRuntimeStep } from '@/pages/denuncias/workflow-runtime'

const MOCK_RESPONSAVEIS = ['Maria Silva · Compliance', 'João Costa · RH', 'Equipa triagem · Pool']
const MOCK_INVESTIGADORES = [
  { id: 'mock-maria', name: 'Maria Silva', email: 'maria.silva@interno.mock' },
  { id: 'mock-joao', name: 'João Costa', email: 'joao.costa@interno.mock' },
  { id: 'mock-equipa', name: 'Equipa Triagem', email: 'triagem@interno.mock' },
]
const VINCULO_TIPO_OPTIONS = [
  {
    value: 'RELATED',
    label: 'Relacionada',
    description: 'Mesmo contexto, apuração conectada.',
    keywords: 'relacionada correlata contexto',
  },
  {
    value: 'DUPLICATE',
    label: 'Duplicada',
    description: 'Mesmo fato já registado em outro protocolo.',
    keywords: 'duplicada repetida igual',
  },
  {
    value: 'FOLLOW_UP',
    label: 'Seguimento',
    description: 'Continuação de caso anterior.',
    keywords: 'seguimento continuidade desdobramento',
  },
] as const

type TriagemChecklistDef = Readonly<{
  id: string
  acao: string
  detalhe: string
  icon: LucideIcon
}>

type TriagemHelperContent = Readonly<{
  titulo: string
  oQueVerificar: string
  comoRegistrar: string
  alerta?: string
}>

const TRIAGEM_HELPERS: Readonly<Record<string, TriagemHelperContent>> = {
  admissibilidade: {
    titulo: 'Análise de admissibilidade',
    oQueVerificar: 'Confirme se há fato mínimo, contexto e aderência ao canal.',
    comoRegistrar: 'Descreva em uma frase objetiva o motivo da admissão ou ressalva inicial.',
  },
  complementacao: {
    titulo: 'Solicitação de complementação',
    oQueVerificar: 'Identifique lacunas essenciais: data, local, envolvidos ou evidências citadas.',
    comoRegistrar: 'Registre apenas o pedido objetivo, sem expor dados sensíveis desnecessários.',
  },
  'prioridade-risco': {
    titulo: 'Classificação de prioridade',
    oQueVerificar: 'Considere impacto potencial, urgência e risco de recorrência imediata.',
    comoRegistrar: 'Selecione o nível e justifique com critério curto e verificável.',
  },
  'conflito-interesse': {
    titulo: 'Validação de imparcialidade',
    oQueVerificar: 'Cheque vínculo hierárquico, pessoal ou atuação prévia no mesmo fato.',
    comoRegistrar: 'Indique SIM/NÃO e, se houver conflito, registre a medida de reatribuição.',
    alerta: 'Atenção: conflito de interesse exige rastreabilidade da substituição do responsável.',
  },
  'decisao-rota': {
    titulo: 'Definição da rota',
    oQueVerificar: 'Escolha o encaminhamento proporcional à gravidade e ao tipo de relato.',
    comoRegistrar: 'Registre a rota selecionada e a justificativa objetiva em linguagem técnica.',
  },
  documentar: {
    titulo: 'Formalização da decisão',
    oQueVerificar: 'Garanta coerência entre checklist, rota escolhida e fundamentação final.',
    comoRegistrar: 'Documente a decisão completa com texto claro, sem identificação indevida.',
  },
}

function TriagemCheckItem({
  item,
  stepIndex,
  totalSteps,
  checked,
  active,
  onClick,
}: Readonly<{
  item: TriagemChecklistDef
  stepIndex: number
  totalSteps: number
  checked: boolean
  active: boolean
  onClick: () => void
}>) {
  const Icon = item.icon
  const isLast = stepIndex >= totalSteps - 1

  return (
    <button
      type="button"
      onClick={onClick}
      role="status"
      aria-label={`${item.acao}: ${checked ? 'concluído' : 'pendente'}`}
      className={cn(
        'group/triagem relative flex w-full gap-2 rounded-lg border px-1.5 py-1.5 text-left transition-[border-color,background-color,box-shadow] duration-200 motion-reduce:transition-none',
        checked
          ? 'border-primary/30 bg-primary/[0.07] shadow-[inset_3px_0_0_0_var(--primary)]'
          : 'border-border/55 bg-background',
        active && 'border-primary/70 bg-primary/[0.09] ring-1 ring-primary/35',
      )}
    >
      <div className="relative flex w-7 shrink-0 flex-col items-center pt-0.5">
        {!isLast ? (
          <div
            aria-hidden
            className={cn(
              'absolute top-6 left-1/2 w-px -translate-x-1/2 rounded-full transition-colors duration-300 motion-reduce:transition-none',
              checked ? 'bg-primary/45' : 'bg-border/80',
            )}
            style={{ height: 'calc(100% + 0.5rem)' }}
          />
        ) : null}
        <span
          aria-hidden
          className={cn(
            'relative z-[1] flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-[transform,background-color,border-color,box-shadow,color] duration-300 motion-reduce:transition-none',
            checked
              ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_20%,transparent)] motion-safe:scale-100'
              : 'border-border/70 bg-muted/25 text-muted-foreground',
          )}
        >
          {checked ? (
            <Check className="triagem-check-pop size-3.5" strokeWidth={2.5} />
          ) : (
            <Icon className="size-3.5 opacity-88 transition-opacity duration-200" strokeWidth={2} />
          )}
        </span>
      </div>

      <div className="min-w-0 flex-1 py-0.5 pr-0.5">
        <p
          className={cn(
            'text-[11px] font-medium leading-tight',
            checked && 'text-muted-foreground line-through decoration-primary/45 decoration-1',
          )}
        >
          {item.acao}
          <span className="text-muted-foreground ml-1 text-[10px] font-normal tabular-nums">
            {stepIndex + 1}/{totalSteps}
          </span>
        </p>
        <p
          className={cn(
            'text-muted-foreground mt-0.5 truncate text-[10px] leading-tight transition-opacity duration-200',
            checked && 'opacity-65',
          )}
          title={item.detalhe}
        >
          {item.detalhe}
        </p>
      </div>
    </button>
  )
}

const TRIAGEM_CHECKLIST: ReadonlyArray<TriagemChecklistDef> = [
  {
    id: 'admissibilidade',
    acao: 'Admissibilidade',
    detalhe:
      'Verificar se o relato não é vazio, ofensivo, fora de âmbito, duplicado ou manifestamente infundado.',
    icon: FileCheck2,
  },
  {
    id: 'complementacao',
    acao: 'Complementação',
    detalhe: 'Solicitar fato, data, local ou testemunhas em falta — sem violar anonimato desnecessariamente.',
    icon: MessageCircleQuestion,
  },
  {
    id: 'prioridade-risco',
    acao: 'Prioridade de risco',
    detalhe: 'Avaliar gravidade, urgência (segurança, SST, suborno) e exposição da organização.',
    icon: Zap,
  },
  {
    id: 'conflito-interesse',
    acao: 'Conflito de interesse',
    detalhe: 'Verificar se o triador ou investigador deve ser afastado; reatribuir se necessário.',
    icon: Scale,
  },
  {
    id: 'decisao-rota',
    acao: 'Decisão de rota',
    detalhe:
      'Abrir investigação formal, acionar ação corretiva leve, encaminhar a outro comitê, ou arquivar com motivo.',
    icon: GitBranch,
  },
  {
    id: 'documentar',
    acao: 'Documentar decisão',
    detalhe: 'Registar a fundamentação da triagem de forma não identificante onde couber.',
    icon: PenLine,
  },
]

type Envolvido = {
  localId: string
  apiId?: string
  nome: string
  cargo: string
  area: string
  origem: 'interno' | 'externo'
  tipo: 'denunciado' | 'testemunha' | 'vitima'
}

type ComentarioInterno = {
  id: string
  autor: string
  texto: string
  quando: string
}

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

export type InvestigacaoRecepcaoViewProps = Readonly<{
  denuncia: DenunciaMock
  phase?: CanonicalInvestigacaoPhase
  investigation?: InvestigationDto | null
  steps: WorkflowRuntimeStep[]
  visualFlowOrder: number[]
  suggestedVisualPos: number
  workspaceVisualPos: number
  setWorkspaceStepIndex: (stepIndex: number) => void
  voltarPara?: InvestigacaoShellVoltar
}>

export function InvestigacaoRecepcaoView({
  denuncia,
  phase = 'recepcao',
  investigation,
  steps,
  visualFlowOrder,
  suggestedVisualPos,
  workspaceVisualPos,
  setWorkspaceStepIndex,
  voltarPara,
}: InvestigacaoRecepcaoViewProps) {
  const isRecepcao = phase === 'recepcao'
  const isTriagem = phase === 'triagem'
  const [envolvidos, setEnvolvidos] = useState<Envolvido[]>([])
  const [utilizadorInternoMock, setUtilizadorInternoMock] = useState<string | undefined>(undefined)
  const [novoEnvolvidoAberto, setNovoEnvolvidoAberto] = useState(false)
  const [novoEnvolvido, setNovoEnvolvido] = useState<{
    nome: string
    cargo: string
    area: string
    origem: 'interno' | 'externo'
    tipo: Envolvido['tipo']
  }>({
    nome: '',
    cargo: '',
    area: '',
    origem: 'externo',
    tipo: 'denunciado',
  })
  const [comentarios, setComentarios] = useState<ComentarioInterno[]>([])
  const [novoComentario, setNovoComentario] = useState('')
  const [sugestaoIa, setSugestaoIa] = useState<{
    categoria?: string
    risco?: string
    passos?: string
  } | null>(null)
  const [iaAssistenteAberto, setIaAssistenteAberto] = useState(false)
  const [links, setLinks] = useState<ComplaintLinkDto[]>([])
  const [novoVinculoAberto, setNovoVinculoAberto] = useState(false)
  const [vinculoProtocolo, setVinculoProtocolo] = useState('')
  const [vinculoTipo, setVinculoTipo] = useState<'DUPLICATE' | 'RELATED' | 'FOLLOW_UP'>('RELATED')
  const [vinculando, setVinculando] = useState(false)
  const [triageDecision, setTriageDecision] = useState<'FORMAL' | 'CORRECTIVE' | 'COMMITTEE' | 'ARCHIVED'>('FORMAL')
  const [triageDecisionReason, setTriageDecisionReason] = useState('')
  const [leadInvestigatorName, setLeadInvestigatorName] = useState('')
  const [investigadorSelectAberto, setInvestigadorSelectAberto] = useState(false)
  const [utilizadoresInternos, setUtilizadoresInternos] = useState<UserListItemDto[]>([])
  const [restrictedAccess, setRestrictedAccess] = useState(false)
  const [conflitoInteresse, setConflitoInteresse] = useState<'SIM' | 'NAO' | ''>('')
  const [conflitoInteresseObs, setConflitoInteresseObs] = useState('')
  const [complementacaoSolicitada, setComplementacaoSolicitada] = useState('')
  const [prioridadeRisco, setPrioridadeRisco] = useState<'BAIXO' | 'MEDIO' | 'ALTO' | ''>('')
  const [salvandoTriagem, setSalvandoTriagem] = useState(false)
  const [checklistItemAtivo, setChecklistItemAtivo] = useState<string>(TRIAGEM_CHECKLIST[0]?.id ?? 'admissibilidade')
  const [conteudoDenunciaAberto, setConteudoDenunciaAberto] = useState(false)

  const investigationId = investigation?.id ?? null
  const triageDecisionReasonTrimmed = triageDecisionReason.trim()
  const complementacaoSolicitadaTrimmed = complementacaoSolicitada.trim()
  const prioridadeRiscoSelecionada = prioridadeRisco !== ''
  const conflitoInteresseSelecionado = conflitoInteresse !== ''
  const triageDecisionValida =
    triageDecision === 'FORMAL' ||
    triageDecision === 'CORRECTIVE' ||
    triageDecision === 'COMMITTEE' ||
    triageDecision === 'ARCHIVED'
  const triagemChecks = useMemo<Record<string, boolean>>(
    () => ({
      admissibilidade: triageDecisionReasonTrimmed.length >= 20,
      complementacao: complementacaoSolicitadaTrimmed.length > 0,
      'prioridade-risco': prioridadeRiscoSelecionada,
      'conflito-interesse': conflitoInteresseSelecionado,
      'decisao-rota': triageDecisionValida,
      documentar: triageDecisionReasonTrimmed.length >= 40,
    }),
    [
      triageDecisionReasonTrimmed,
      complementacaoSolicitadaTrimmed,
      prioridadeRiscoSelecionada,
      conflitoInteresseSelecionado,
      triageDecisionValida,
    ],
  )
  const triagemConcluidos = useMemo(
    () => TRIAGEM_CHECKLIST.filter((item) => triagemChecks[item.id]).length,
    [triagemChecks],
  )
  const triagemTotal = TRIAGEM_CHECKLIST.length
  const triagemPercentual = triagemTotal === 0 ? 0 : Math.round((triagemConcluidos / triagemTotal) * 100)
  const itemTriagemAtivo = TRIAGEM_CHECKLIST.find((item) => item.id === checklistItemAtivo) ?? TRIAGEM_CHECKLIST[0]
  const helperTriagemAtivo = itemTriagemAtivo ? TRIAGEM_HELPERS[itemTriagemAtivo.id] : undefined

  const guardarTriagem = useCallback(async () => {
    if (!investigationId) {
      toast.error('Investigação ainda não disponível.')
      return
    }
    if (!triageDecisionReason.trim()) {
      toast.message('Preencha a fundamentação da decisão.')
      return
    }
    setSalvandoTriagem(true)
    try {
      await updateInvestigation(investigationId, {
        triageDecision,
        triageDecisionReason: triageDecisionReason.trim(),
        leadInvestigatorName: leadInvestigatorName.trim() || null,
        restrictedAccess,
      })
      toast.success('Decisão de triagem guardada.')
    } catch {
      toast.error('Erro ao guardar decisão de triagem.')
    } finally {
      setSalvandoTriagem(false)
    }
  }, [
    investigationId,
    triageDecision,
    triageDecisionReason,
    leadInvestigatorName,
    restrictedAccess,
  ])

  useEffect(() => {
    if (!investigationId) return
    listComments(investigationId)
      .then((dtos) =>
        setComentarios(
          dtos.map((d) => ({ id: d.id, autor: d.authorName, quando: d.createdAt, texto: d.body })),
        ),
      )
      .catch(() => {})
  }, [investigationId])

  useEffect(() => {
    let cancelled = false
    void fetchUsersList()
      .then((users) => {
        if (!cancelled) setUtilizadoresInternos(users)
      })
      .catch(() => {
        if (!cancelled) setUtilizadoresInternos([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!investigation) return
    if (
      investigation.triageDecision === 'FORMAL' ||
      investigation.triageDecision === 'CORRECTIVE' ||
      investigation.triageDecision === 'COMMITTEE' ||
      investigation.triageDecision === 'ARCHIVED'
    ) {
      setTriageDecision(investigation.triageDecision)
    }
    setTriageDecisionReason(investigation.triageDecisionReason ?? '')
    setLeadInvestigatorName(investigation.leadInvestigatorName ?? '')
    setRestrictedAccess(investigation.restrictedAccess)
  }, [investigation])

  useEffect(() => {
    if (!investigationId) return
    listInvolved(investigationId)
      .then((dtos) =>
        setEnvolvidos(
          dtos.map((d) => ({
            localId: d.id,
            apiId: d.id,
            nome: d.name,
            cargo: d.roleTitle ?? '',
            area: d.area ?? '',
            origem: 'externo',
            tipo:
              d.partyType === 'ACCUSED'
                ? 'denunciado'
                : d.partyType === 'WITNESS'
                  ? 'testemunha'
                  : 'vitima',
          })),
        ),
      )
      .catch(() => {})
  }, [investigationId])

  useEffect(() => {
    if (!denuncia.id) return
    listLinks(denuncia.id)
      .then(setLinks)
      .catch(() => {})
  }, [denuncia.id])

  const vincularDenuncia = useCallback(async () => {
    const protocolo = vinculoProtocolo.trim()
    if (!protocolo) { toast.message('Insira o protocolo da denúncia.'); return }
    setVinculando(true)
    try {
      const link = await createLink(denuncia.id, { targetProtocol: protocolo, linkType: vinculoTipo })
      setLinks((l) => [link, ...l])
      setVinculoProtocolo('')
      setNovoVinculoAberto(false)
      toast.success('Vínculo criado.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg === 'duplicate') toast.error('Vínculo já existe.')
      else if (msg === 'not_found') toast.error('Protocolo não encontrado.')
      else toast.error('Erro ao criar vínculo.')
    } finally {
      setVinculando(false)
    }
  }, [denuncia.id, vinculoProtocolo, vinculoTipo])

  const desvincularDenuncia = useCallback(async (link: ComplaintLinkDto) => {
    try {
      await deleteLink(denuncia.id, link.id)
      setLinks((l) => l.filter((x) => x.id !== link.id))
      toast.success('Vínculo removido.')
    } catch {
      toast.error('Erro ao remover vínculo.')
    }
  }, [denuncia.id])

  const adicionarEnvolvido = useCallback(() => {
    if (!novoEnvolvido.nome.trim()) {
      toast.message('Informe o nome da pessoa envolvida.')
      return
    }
    setEnvolvidos((list) => [
      ...list,
      {
        localId: `e-${Date.now()}`,
        nome: novoEnvolvido.nome.trim(),
        cargo: novoEnvolvido.cargo.trim(),
        area: novoEnvolvido.area.trim(),
        origem: novoEnvolvido.origem,
        tipo: novoEnvolvido.tipo,
      },
    ])
    setNovoEnvolvido((prev) => ({ ...prev, nome: '', cargo: '', area: '', origem: 'externo' }))
    setUtilizadorInternoMock(undefined)
    setNovoEnvolvidoAberto(false)
  }, [novoEnvolvido])

  const preencherInternoMock = useCallback((nomeCompleto: string) => {
    setUtilizadorInternoMock(nomeCompleto)
    const [nome, cargo] = nomeCompleto.split('·').map((s) => s.trim())
    setNovoEnvolvido((prev) => ({
      ...prev,
      origem: 'interno',
      nome: nome ?? prev.nome,
      cargo: cargo ?? prev.cargo,
    }))
  }, [])

  const removerEnvolvido = useCallback(
    async (e: Envolvido) => {
      if (e.apiId && investigationId) {
        try {
          await deleteInvolved(investigationId, e.apiId)
        } catch {
          toast.error('Erro ao remover envolvido.')
          return
        }
      }
      setEnvolvidos((list) => list.filter((x) => x.localId !== e.localId))
    },
    [investigationId],
  )

  const publicarComentario = useCallback(async () => {
    const t = novoComentario.trim()
    if (!t) {
      toast.message('Escreva um comentário.')
      return
    }
    if (investigationId) {
      try {
        const dto = await addComment(investigationId, 'utilizador.atual', t)
        setComentarios((c) => [
          ...c,
          { id: dto.id, autor: dto.authorName, quando: dto.createdAt, texto: dto.body },
        ])
        setNovoComentario('')
        toast.success('Comentário publicado.')
      } catch {
        toast.error('Erro ao publicar comentário.')
      }
    } else {
      setComentarios((c) => [
        ...c,
        {
          id: `c-${Date.now()}`,
          autor: 'utilizador.mock',
          quando: new Date().toISOString(),
          texto: t,
        },
      ])
      setNovoComentario('')
      toast.message('Comentário registado (sem ligação ao servidor)')
    }
  }, [novoComentario, investigationId])

  const opcoesInvestigador = useMemo(
    () =>
      utilizadoresInternos.length > 0
        ? utilizadoresInternos.map((u) => ({
            id: u.id,
            nome: u.name,
            detalhe: u.email,
            busca: `${u.name} ${u.email} ${u.perfil?.name ?? ''}`,
          }))
        : MOCK_INVESTIGADORES.map((u) => ({
            id: u.id,
            nome: u.name,
            detalhe: u.email,
            busca: `${u.name} ${u.email}`,
          })),
    [utilizadoresInternos],
  )

  return (
    <InvestigacaoWorkspaceShell
      denuncia={denuncia}
      steps={steps}
      visualFlowOrder={visualFlowOrder}
      suggestedVisualPos={suggestedVisualPos}
      workspaceVisualPos={workspaceVisualPos}
      setWorkspaceStepIndex={setWorkspaceStepIndex}
      voltarPara={voltarPara}
      leftColumn={
        <>
          <InvestigacaoPainelConteudoOriginal
            denuncia={denuncia}
            acaoMetadados={
              !isRecepcao ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[11px]"
                  onClick={() => setConteudoDenunciaAberto(true)}
                >
                  Ver conteúdo da denúncia
                </Button>
              ) : undefined
            }
          />
        </>
      }
      centerColumn={
        <>
            {isRecepcao && (
              <InvestigacaoWorkspaceSecao
                variant="formulario"
                titulo="Leitura inicial da denúncia"
                subtitulo="Foco total no relato original para compreensão do contexto antes da triagem."
                tituloIcon={<FileText className="size-[1.05rem] sm:size-[1.15rem]" strokeWidth={2} aria-hidden />}
              >
                <div className="rounded-lg border border-border/60 bg-muted/15 p-2">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wide">
                    Protocolo {denuncia.protocolo}
                  </p>
                  <p className="text-foreground mt-1 text-[11px] font-medium">
                    {denuncia.titulo || 'Sem título informado'}
                  </p>
                </div>
                <blockquote className="border-primary/35 bg-background text-foreground max-h-[min(76vh,920px)] overflow-y-auto rounded-md border-l-[3px] px-3 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ring-1 ring-border/40">
                  {denuncia.relatoOriginal || '—'}
                </blockquote>
              </InvestigacaoWorkspaceSecao>
            )}
            {isTriagem && (
              <InvestigacaoWorkspaceSecao
                variant="formulario"
                titulo="Checklist de triagem"
                subtitulo="Verificar cada ponto antes de definir a rota da denúncia."
                tituloIcon={<ClipboardCheck className="size-[1.05rem] sm:size-[1.15rem]" strokeWidth={2} aria-hidden />}
              >
                <div className="rounded-lg border border-border/60 bg-muted/15 px-2 py-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="bg-primary/12 text-primary inline-flex size-6 shrink-0 items-center justify-center rounded-md">
                        <ClipboardCheck className="size-3" aria-hidden />
                      </span>
                      <p className="text-foreground text-[11px] font-medium leading-tight">
                        {triagemConcluidos}/{triagemTotal} concluídos
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1" role="list" aria-label="Progresso por etapa">
                    {TRIAGEM_CHECKLIST.map((item) => {
                      const done = Boolean(triagemChecks[item.id])
                      return (
                        <div
                          key={item.id}
                          role="listitem"
                          title={item.acao}
                          className={cn(
                            'h-1.5 min-w-0 flex-1 rounded-full transition-[background-color,transform] duration-300 motion-reduce:transition-none',
                            done ? 'bg-primary motion-safe:scale-y-110' : 'bg-muted',
                          )}
                        />
                      )
                    })}
                  </div>
                  <p className="text-muted-foreground mt-1 text-[10px] tabular-nums">
                    {triagemPercentual}% concluído · {triagemConcluidos}/{triagemTotal}
                  </p>
                </div>
                <div className="grid gap-1.5 md:grid-cols-2">
                  {TRIAGEM_CHECKLIST.map((item, index) => (
                    <TriagemCheckItem
                      key={item.id}
                      item={item}
                      stepIndex={index}
                      totalSteps={triagemTotal}
                      checked={Boolean(triagemChecks[item.id])}
                      active={item.id === checklistItemAtivo}
                      onClick={() => setChecklistItemAtivo(item.id)}
                    />
                  ))}
                </div>
                <div className="space-y-2 rounded-md border border-border/60 bg-muted/15 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {itemTriagemAtivo?.acao ?? 'Checklist'}
                      </p>
                      <p className="text-muted-foreground text-[10px] leading-tight">
                        {itemTriagemAtivo?.detalhe}
                      </p>
                    </div>
                    <Badge variant={triagemChecks[checklistItemAtivo] ? 'default' : 'secondary'} className="h-5 text-[10px]">
                      {triagemChecks[checklistItemAtivo] ? 'Concluído' : 'Pendente'}
                    </Badge>
                  </div>
                  {helperTriagemAtivo ? (
                    <div className="space-y-1.5">
                      <div className="rounded-md border border-primary/20 bg-primary/[0.06] px-2 py-1.5">
                        <p className="text-[10px] font-semibold text-primary">{helperTriagemAtivo.titulo}</p>
                        <p className="text-muted-foreground mt-0.5 text-[10px] leading-tight">
                          <span className="text-foreground/90 font-medium">O que verificar:</span>{' '}
                          {helperTriagemAtivo.oQueVerificar}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-[10px] leading-tight">
                          <span className="text-foreground/90 font-medium">Como registrar:</span>{' '}
                          {helperTriagemAtivo.comoRegistrar}
                        </p>
                      </div>
                      {helperTriagemAtivo.alerta ? (
                        <div className="rounded-md border border-amber-300/45 bg-amber-50/70 px-2 py-1.5 dark:border-amber-400/25 dark:bg-amber-500/10">
                          <p className="flex items-start gap-1.5 text-[10px] leading-tight text-amber-800 dark:text-amber-300">
                            <AlertCircle className="mt-px size-3 shrink-0" aria-hidden />
                            <span>{helperTriagemAtivo.alerta}</span>
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  {checklistItemAtivo === 'admissibilidade' ? (
                    <div className="space-y-1">
                      <Label className="text-[11px]">Fundamentação curta</Label>
                      <Textarea
                        value={triageDecisionReason}
                        onChange={(e) => setTriageDecisionReason(e.target.value)}
                        placeholder="Resuma por que a denúncia é admissível (mín. 20 caracteres)."
                        className="min-h-[64px] text-xs"
                      />
                    </div>
                  ) : null}
                  {checklistItemAtivo === 'complementacao' ? (
                    <div className="space-y-1">
                      <Label className="text-[11px]">Complementação solicitada</Label>
                      <Input
                        value={complementacaoSolicitada}
                        onChange={(e) => setComplementacaoSolicitada(e.target.value)}
                        placeholder="Ex.: informar data/local"
                        className="h-8 text-xs"
                      />
                    </div>
                  ) : null}
                  {checklistItemAtivo === 'prioridade-risco' ? (
                    <div className="space-y-1">
                      <Label className="text-[11px]">Prioridade de risco</Label>
                      <Select
                        value={prioridadeRisco}
                        onValueChange={(v) => setPrioridadeRisco(v as typeof prioridadeRisco)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BAIXO">Baixo</SelectItem>
                          <SelectItem value="MEDIO">Médio</SelectItem>
                          <SelectItem value="ALTO">Alto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}
                  {checklistItemAtivo === 'conflito-interesse' ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-[11px]">Conflito de interesse</Label>
                        <Select
                          value={conflitoInteresse}
                          onValueChange={(v) => setConflitoInteresse(v as typeof conflitoInteresse)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NAO">Não</SelectItem>
                            <SelectItem value="SIM">Sim</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px]">Observação</Label>
                        <Input
                          value={conflitoInteresseObs}
                          onChange={(e) => setConflitoInteresseObs(e.target.value)}
                          placeholder="Opcional"
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  ) : null}
                  {checklistItemAtivo === 'decisao-rota' ? (
                    <div className="space-y-1">
                      <Label className="text-[11px]">Rota do caso</Label>
                      <Select value={triageDecision} onValueChange={(v) => setTriageDecision(v as typeof triageDecision)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FORMAL">Abrir investigação formal</SelectItem>
                          <SelectItem value="CORRECTIVE">Ação corretiva leve</SelectItem>
                          <SelectItem value="COMMITTEE">Encaminhar comitê</SelectItem>
                          <SelectItem value="ARCHIVED">Arquivar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}
                  {checklistItemAtivo === 'documentar' ? (
                    <div className="space-y-1">
                      <Label className="text-[11px]">Fundamentação final</Label>
                      <Textarea
                        value={triageDecisionReason}
                        onChange={(e) => setTriageDecisionReason(e.target.value)}
                        placeholder="Documente a decisão final da triagem (mín. 40 caracteres)."
                        className="min-h-[74px] text-xs"
                      />
                    </div>
                  ) : null}
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-[11px]">Investigador responsável</Label>
                      <Popover open={investigadorSelectAberto} onOpenChange={setInvestigadorSelectAberto}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={investigadorSelectAberto}
                            className="h-8 w-full justify-between px-2 text-xs font-normal"
                          >
                            <span className="truncate">
                              {leadInvestigatorName || 'Nome do responsável'}
                            </span>
                            <Users className="text-muted-foreground size-3.5 shrink-0 opacity-80" aria-hidden />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
                          <Command>
                            <CommandInput placeholder="Buscar utilizador interno..." />
                            <CommandList>
                              <CommandEmpty>Nenhum utilizador encontrado</CommandEmpty>
                              <CommandGroup>
                                {opcoesInvestigador.map((utilizador) => (
                                  <CommandItem
                                    key={utilizador.id}
                                    value={utilizador.busca}
                                    onSelect={() => {
                                      setLeadInvestigatorName(utilizador.nome)
                                      setInvestigadorSelectAberto(false)
                                    }}
                                    className="text-xs"
                                  >
                                    <div className="flex min-w-0 flex-col">
                                      <span className="truncate">{utilizador.nome}</span>
                                      <span className="text-muted-foreground truncate text-[10px]">
                                        {utilizador.detalhe}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 text-[11px]">
                        <Checkbox
                          checked={restrictedAccess}
                          onCheckedChange={(v) => setRestrictedAccess(Boolean(v))}
                        />
                        Caso sensível — restringir acesso
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={guardarTriagem}
                      disabled={salvandoTriagem}
                    >
                      {salvandoTriagem ? 'A guardar...' : 'Guardar decisão'}
                    </Button>
                  </div>
                </div>
              </InvestigacaoWorkspaceSecao>
            )}

            {!isRecepcao && (
              <InvestigacaoWorkspaceSecao
                variant="formulario"
                titulo="Comentários internos"
                subtitulo="Menções @ quando integradas."
                tituloIcon={<MessageSquare className="size-[1.05rem] sm:size-[1.15rem]" strokeWidth={2} aria-hidden />}
              >
                <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
                  {comentarios.map((c) => (
                    <div key={c.id} className="border-border/40 flex gap-1.5 border-l-2 pl-2">
                      <UserRound className="text-muted-foreground mt-0.5 size-3.5 shrink-0" aria-hidden />
                      <div>
                        <p className="text-[10px] leading-tight">
                          <span className="text-foreground font-medium">{c.autor}</span>
                          <span className="text-muted-foreground tabular-nums"> · {formatoData(c.quando)}</span>
                        </p>
                        <p className="text-foreground mt-0.5 text-xs leading-snug">{c.texto}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Textarea
                  placeholder="Comentário… @utilizador"
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  className="min-h-[52px] text-xs"
                />
                <div className="flex justify-end">
                  <Button type="button" size="sm" className="h-7 px-2 text-xs" onClick={publicarComentario}>
                    Publicar
                    <SendHorizontal className="size-3.5" data-icon="inline-end" aria-hidden />
                  </Button>
                </div>
              </InvestigacaoWorkspaceSecao>
            )}
            {!isRecepcao && (
              <Dialog open={conteudoDenunciaAberto} onOpenChange={setConteudoDenunciaAberto}>
                <DialogContent className="w-[min(80rem,calc(100%-2rem))] sm:max-w-none">
                  <DialogHeader>
                    <DialogTitle>Conteúdo da denúncia</DialogTitle>
                    <DialogDescription>
                      Protocolo {denuncia.protocolo}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="w-full space-y-2">
                    <p className="text-sm font-medium">{denuncia.titulo || 'Sem título informado'}</p>
                    <div className="max-h-[60vh] overflow-y-auto rounded-md border border-border/60 bg-muted/15 p-3">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{denuncia.relatoOriginal || '—'}</p>
                    </div>
                  </div>
                  <DialogFooter showCloseButton />
                </DialogContent>
              </Dialog>
            )}
        </>
      }
      rightColumn={isRecepcao ? null : (
        <>
          <InvestigacaoWorkspaceSecao
            variant="formulario"
            density="compact"
            titulo="Envolvidos citados"
            tituloIcon={<Users className="size-[1rem] sm:size-[1.05rem]" strokeWidth={2} aria-hidden />}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground text-[10px]">
                {envolvidos.length} {envolvidos.length === 1 ? 'envolvido citado' : 'envolvidos citados'}
              </p>
              <Button
                type="button"
                variant={novoEnvolvidoAberto ? 'secondary' : 'outline'}
                size="sm"
                className="h-7 px-2 text-[11px]"
                onClick={() => setNovoEnvolvidoAberto((prev) => !prev)}
              >
                + Adicionar novo
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {envolvidos.map((e) => (
                <Badge key={e.localId} variant={e.apiId ? 'secondary' : 'outline'} className="h-5 gap-1 pr-1 text-[10px] font-normal">
                  <Avatar className="size-4">
                    <AvatarFallback className="text-[8px]">
                      {(e.nome || '?').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[7rem] truncate">{e.nome || 'Novo'}</span>
                  <span className="text-muted-foreground">· {e.origem} · {e.tipo}</span>
                </Badge>
              ))}
            </div>
            {novoEnvolvidoAberto ? (
              <div className="rounded-md border border-border/50 bg-muted/10 p-1.5">
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-6">
                  <Button
                    type="button"
                    variant={novoEnvolvido.origem === 'interno' ? 'secondary' : 'outline'}
                    size="sm"
                    className="h-6 text-[10px] sm:col-span-3"
                    onClick={() => setNovoEnvolvido((prev) => ({ ...prev, origem: 'interno', nome: '', cargo: '', area: '' }))}
                  >
                    <Building2 className="mr-0.5 size-3" aria-hidden />
                    Interno
                  </Button>
                  <Button
                    type="button"
                    variant={novoEnvolvido.origem === 'externo' ? 'secondary' : 'outline'}
                    size="sm"
                    className="h-6 text-[10px] sm:col-span-3"
                    onClick={() => {
                      setUtilizadorInternoMock(undefined)
                      setNovoEnvolvido((prev) => ({ ...prev, origem: 'externo', nome: '', cargo: '', area: '' }))
                    }}
                  >
                    <UserRound className="mr-0.5 size-3" aria-hidden />
                    Não interno
                  </Button>
                  {novoEnvolvido.origem === 'interno' ? (
                    <>
                      <div className="space-y-1 sm:col-span-4">
                        <Label htmlFor="rececao-util-interno-mock" className="text-[10px]">Utilizador interno</Label>
                        <Select value={utilizadorInternoMock} onValueChange={preencherInternoMock}>
                          <SelectTrigger id="rececao-util-interno-mock" className="h-7 w-full text-[11px]">
                            <SelectValue placeholder="Buscar/selecionar utilizador interno" />
                          </SelectTrigger>
                          <SelectContent position="popper" sideOffset={6} align="start" className="rounded-lg">
                            {MOCK_RESPONSAVEIS.map((n) => (
                              <SelectItem key={n} value={n} className="rounded-md text-xs">
                                {n}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Select
                        value={novoEnvolvido.tipo}
                        onValueChange={(v) => setNovoEnvolvido((prev) => ({ ...prev, tipo: v as Envolvido['tipo'] }))}
                      >
                        <SelectTrigger className="h-7 text-[11px] sm:col-span-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="denunciado">Denunciado</SelectItem>
                          <SelectItem value="testemunha">Testemunha</SelectItem>
                          <SelectItem value="vitima">Vítima</SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <>
                      <Input
                        placeholder="Nome"
                        value={novoEnvolvido.nome}
                        onChange={(ev) => setNovoEnvolvido((prev) => ({ ...prev, nome: ev.target.value }))}
                        className="h-7 text-[11px] sm:col-span-4"
                      />
                      <Select
                        value={novoEnvolvido.tipo}
                        onValueChange={(v) => setNovoEnvolvido((prev) => ({ ...prev, tipo: v as Envolvido['tipo'] }))}
                      >
                        <SelectTrigger className="h-7 text-[11px] sm:col-span-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="denunciado">Denunciado</SelectItem>
                          <SelectItem value="testemunha">Testemunha</SelectItem>
                          <SelectItem value="vitima">Vítima</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Cargo"
                        value={novoEnvolvido.cargo}
                        onChange={(ev) => setNovoEnvolvido((prev) => ({ ...prev, cargo: ev.target.value }))}
                        className="h-7 text-[11px] sm:col-span-3"
                      />
                      <Input
                        placeholder="Área"
                        value={novoEnvolvido.area}
                        onChange={(ev) => setNovoEnvolvido((prev) => ({ ...prev, area: ev.target.value }))}
                        className="h-7 text-[11px] sm:col-span-3"
                      />
                    </>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 px-2 text-[11px] sm:col-span-6"
                    onClick={adicionarEnvolvido}
                  >
                    <UserPlus className="size-3" aria-hidden />
                    Adicionar
                  </Button>
                </div>
              </div>
            ) : null}
            {envolvidos.length === 0 ? (
              <p className="text-muted-foreground text-[10px] leading-snug">Nenhuma pessoa citada.</p>
            ) : (
              <ul className="space-y-1">
                {envolvidos.map((e) => {
                  const meta = [e.tipo, e.cargo, e.area].filter(Boolean).join(' · ')
                  return (
                    <li
                      key={e.localId}
                      className="border-border/50 flex items-start justify-between gap-2 rounded-md border px-2 py-1.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-medium">{e.nome || 'Novo'}</p>
                        {meta ? <p className="text-muted-foreground truncate text-[10px]">{meta}</p> : null}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive h-6 shrink-0 px-1.5"
                        onClick={() => removerEnvolvido(e)}
                        aria-label={`Remover ${e.nome || 'pessoa'}`}
                      >
                        <X className="size-3.5" aria-hidden />
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}
          </InvestigacaoWorkspaceSecao>

          <InvestigacaoWorkspaceSecao
            variant="formulario"
            density="compact"
            titulo="Vínculos entre denúncias"
            tituloIcon={<GitCompare className="size-[1rem] sm:size-[1.05rem]" strokeWidth={2} aria-hidden />}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-muted-foreground text-[10px]">
                  {links.length} {links.length === 1 ? 'vínculo registado' : 'vínculos registados'}
                </p>
                <Button
                  type="button"
                  variant={novoVinculoAberto ? 'secondary' : 'outline'}
                  size="sm"
                  className="h-7 px-2 text-[11px]"
                  onClick={() => setNovoVinculoAberto((prev) => !prev)}
                >
                  + Adicionar vínculo
                </Button>
              </div>

              {links.length === 0 ? (
                <p className="text-muted-foreground text-[10px] leading-snug">Nenhum vínculo registado.</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {links.map((lk) => {
                    const outro = lk.source.id === denuncia.id ? lk.target : lk.source
                    return (
                      <Badge key={lk.id} variant="secondary" className="h-5 gap-1 pr-1 text-[10px] font-normal">
                        <Link2 className="size-3 shrink-0 opacity-80" aria-hidden />
                        <span className="max-w-[7rem] truncate">{outro.protocol}</span>
                        <span className="text-muted-foreground">· {LINK_TYPE_LABEL[lk.linkType]}</span>
                      </Badge>
                    )
                  })}
                </div>
              )}

              {novoVinculoAberto ? (
                <div className="rounded-md border border-border/50 bg-muted/10 p-1.5">
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-6">
                    <Input
                      placeholder="Protocolo"
                      value={vinculoProtocolo}
                      onChange={(e) =>
                        setVinculoProtocolo(
                          e.target.value
                            .toUpperCase()
                            .replace(/\s+/g, ''),
                        )
                      }
                      className="h-7 text-[11px] sm:col-span-3"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') vincularDenuncia()
                      }}
                    />
                    <Select value={vinculoTipo} onValueChange={(v) => setVinculoTipo(v as typeof vinculoTipo)}>
                      <SelectTrigger className="h-7 text-[11px] sm:col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VINCULO_TIPO_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 px-2 text-[11px] sm:col-span-6"
                      onClick={vincularDenuncia}
                      disabled={vinculando || !vinculoProtocolo.trim()}
                    >
                      <ArrowRightLeft className="size-3 shrink-0" aria-hidden />
                      Vincular
                    </Button>
                  </div>
                </div>
              ) : null}

              {links.length > 0 ? (
                <ul className="space-y-1">
                  {links.map((lk) => {
                    const outro = lk.source.id === denuncia.id ? lk.target : lk.source
                    return (
                      <li
                        key={lk.id}
                        className="border-border/50 flex items-start justify-between gap-2 rounded-md border px-2 py-1.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-medium">{outro.protocol}</p>
                          <p className="text-muted-foreground truncate text-[10px]">
                            {LINK_TYPE_LABEL[lk.linkType]}
                            {lk.note ? ` · ${lk.note}` : ''}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive h-6 shrink-0 px-1.5"
                          onClick={() => desvincularDenuncia(lk)}
                          aria-label="Remover vínculo"
                        >
                          <X className="size-3.5" aria-hidden />
                        </Button>
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </div>
          </InvestigacaoWorkspaceSecao>
        </>
      )}
      floatingSlot={
      <Popover open={iaAssistenteAberto} onOpenChange={setIaAssistenteAberto}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            size="icon"
            aria-expanded={iaAssistenteAberto}
            aria-haspopup="dialog"
            aria-label={iaAssistenteAberto ? 'Fechar assistente IA' : 'Abrir assistente IA'}
            className={cn(
              'fixed z-[100] size-14 rounded-full shadow-lg ring-2 ring-background transition-[transform,box-shadow] hover:scale-[1.03] hover:shadow-xl active:scale-[0.98]',
              'bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] md:bottom-8 md:right-8',
            )}
          >
            <span className="relative flex size-full items-center justify-center">
              <Bot className="size-6" strokeWidth={2} aria-hidden />
              {sugestaoIa ? (
                <span className="bg-primary ring-background absolute top-2 right-2 size-2.5 rounded-full ring-2" aria-hidden />
              ) : null}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          sideOffset={16}
          collisionPadding={16}
          className={cn(
            'z-[110] w-[min(22rem,calc(100vw-2rem))] max-w-none gap-0 border-border/60 bg-card/95 p-0 shadow-xl ring-1 ring-black/[0.06] backdrop-blur-md duration-200 dark:bg-card/90 dark:ring-white/[0.08]',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          )}
        >
          <div className="flex max-h-[min(70vh,34rem)] flex-col gap-4 overflow-y-auto overscroll-contain p-4">
            <div className="flex items-start gap-3 border-b border-border/50 pb-4">
              <div
                className="bg-primary/12 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] dark:bg-primary/15"
                aria-hidden
              >
                <Bot className="size-5" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1 space-y-1 pr-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-heading text-sm font-semibold tracking-tight">Assistente IA</h2>
                  <Badge variant="secondary" className="h-5 px-1.5 text-[9px] font-medium uppercase tracking-wide">
                    Mock
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Sugestões simuladas — reveja e aplique só o que fizer sentido para este caso.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground size-8 shrink-0"
                onClick={() => setIaAssistenteAberto(false)}
                aria-label="Fechar painel do assistente"
              >
                <X className="size-4" aria-hidden />
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-muted-foreground px-0.5 text-[10px] font-semibold uppercase tracking-wider">
                Ações rápidas
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="border-border/60 bg-background/80 hover:bg-background h-auto min-h-10 w-full justify-start gap-2.5 px-3 py-2 text-left text-xs font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  onClick={() => {
                    setSugestaoIa({
                      categoria: 'Assédio moral · subcategoria equipa comercial',
                      risco: 'Reputacional + legal médio',
                      passos: 'Confirmar testemunhas; pedir calendário de reuniões; manter anonimato.',
                    })
                    toast.message('Classificação sugerida')
                  }}
                >
                  <Sparkles className="text-primary size-4 shrink-0 opacity-90" aria-hidden />
                  <span className="leading-snug">Sugerir classificação</span>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="border-border/60 bg-background/80 hover:bg-background h-auto min-h-10 w-full justify-start gap-2.5 px-3 py-2 text-left text-xs font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  onClick={() => {
                    setSugestaoIa((s) => ({
                      ...s,
                      risco: 'Operacional (disrupção de equipa) · SST se indicadores de stress',
                    }))
                    toast.message('Riscos sugeridos')
                  }}
                >
                  <AlertCircle className="text-primary size-4 shrink-0 opacity-90" aria-hidden />
                  <span className="leading-snug">Sugerir riscos</span>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="border-border/60 bg-background/80 hover:bg-background h-auto min-h-10 w-full justify-start gap-2.5 px-3 py-2 text-left text-xs font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  onClick={() =>
                    toast.success('Resumo (mock)', {
                      description:
                        'Relato descreve padrão recorrente em contexto profissional com impacto em cliente; falta calendarização exata. A triagem formal ficará na etapa dedicada.',
                    })
                  }
                >
                  <FileText className="text-primary size-4 shrink-0 opacity-90" aria-hidden />
                  <span className="leading-snug">Gerar resumo automático</span>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="border-border/60 bg-background/80 hover:bg-background h-auto min-h-10 w-full justify-start gap-2.5 px-3 py-2 text-left text-xs font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  onClick={() =>
                    toast.message('Inconsistências (mock)', {
                      description: 'Nenhuma inconsistência forte detetada no texto curto.',
                    })
                  }
                >
                  <FileSearch className="text-primary size-4 shrink-0 opacity-90" aria-hidden />
                  <span className="leading-snug">Detectar inconsistências</span>
                </Button>
              </div>
            </div>
            {sugestaoIa ? (
              <Card className="border-primary/30 shadow-none ring-1 ring-primary/10">
                <CardHeader className="space-y-0 px-3 py-2.5 pb-2">
                  <CardTitle className="text-xs font-semibold">Última sugestão</CardTitle>
                  <CardDescription className="text-[10px] leading-snug">Pode aplicar à classificação ou descartar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 px-3 pb-3 pt-0 text-[11px] leading-relaxed">
                  {sugestaoIa.categoria ? (
                    <p>
                      <span className="text-muted-foreground">Categoria:</span> {sugestaoIa.categoria}
                    </p>
                  ) : null}
                  {sugestaoIa.risco ? (
                    <p>
                      <span className="text-muted-foreground">Risco:</span> {sugestaoIa.risco}
                    </p>
                  ) : null}
                  {sugestaoIa.passos ? (
                    <p>
                      <span className="text-muted-foreground">Próximos passos:</span> {sugestaoIa.passos}
                    </p>
                  ) : null}
                  <div className="flex gap-2 pt-1">
                    <Button type="button" size="sm" className="h-8 flex-1 text-xs font-medium" onClick={() => { setSugestaoIa(null); toast.success('Sugestão registada (mock)') }}>
                      Aplicar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 flex-1 text-xs font-medium"
                      onClick={() => setSugestaoIa(null)}
                    >
                      Descartar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}
            <div className="border-border/50 rounded-lg border bg-muted/25 p-3 dark:bg-muted/15">
              <div className="text-muted-foreground mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide">
                <History className="size-3.5 shrink-0 opacity-80" aria-hidden />
                Decisões
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">Nenhuma nesta sessão.</p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      }
    />
  )
}

export { isRececaoWorkspaceStep } from '@/pages/denuncias/investigacao-workspace-canonical'
