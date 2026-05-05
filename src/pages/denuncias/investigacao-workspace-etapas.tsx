import { format, isValid, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import {
  AlertTriangle,
  BadgeCheck,
  Ban,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  CircleDashed,
  FileDown,
  FileJson,
  FileText,
  Gavel,
  GitBranch,
  HelpCircle,
  History,
  Kanban,
  Link2,
  ListChecks,
  MessageSquare,
  Play,
  Scale,
  SendHorizontal,
  Shield,
  Sparkles,
  Plus,
  Upload,
  UserCheck,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { DenunciaMock } from '@/pages/denuncias/denuncias-mock'
import type { CanonicalInvestigacaoPhase } from '@/pages/denuncias/investigacao-workspace-canonical'
import { InvestigacaoWorkspaceSecao } from '@/pages/denuncias/investigacao-workspace-secao'
import type { WorkflowRuntimeStep } from '@/pages/denuncias/workflow-runtime'
import { fetchUsersList, type UserListItemDto } from '@/services/user-profile-service'
import {
  addAction,
  addApproval,
  listActions,
  listApprovals,
  updateAction,
  updateApproval,
  updateInvestigation,
  type ApprovalDecisionDto,
  type CorrectiveActionDto,
  type InvestigationDto,
} from '@/services/investigation-service'

type TransitionLite = {
  edgeId: string
  label: string
  targetLabel: string
}

/** Triagem: gate + risco + IA (mock). */
function TriagemCentro({
  denuncia,
  transitions,
}: Readonly<{ denuncia: DenunciaMock; transitions: TransitionLite[] }>) {
  const [prioridade, setPrioridade] = useState<'P1' | 'P2' | 'P3'>('P2')
  const score = useMemo(() => {
    const base = denuncia.prioridade === 'P1' ? 72 : denuncia.prioridade === 'P2' ? 54 : 38
    return Math.min(98, base + (denuncia.evidencias.length > 0 ? 8 : 0))
  }, [denuncia])

  return (
    <>
      <InvestigacaoWorkspaceSecao
        variant="formulario"
        titulo="Gate — caso formal"
        subtitulo="Após confirmar, o registo passa a tratamento como caso (não apenas denúncia inicial)."
        tituloIcon={<GitBranch className="size-[1.05rem] sm:size-[1.15rem]" strokeWidth={2} aria-hidden />}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            className="h-9 flex-1 gap-1.5 text-xs sm:min-w-[9rem]"
            onClick={() =>
              toast.success('Prosseguir para investigação (mock)', {
                description: 'No produto: transição de workflow + auditoria.',
              })
            }
          >
            <BadgeCheck className="size-3.5 shrink-0" aria-hidden />
            Prosseguir investigação
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-9 flex-1 gap-1.5 text-xs sm:min-w-[9rem]"
            onClick={() => toast.message('Solicitar mais informação (mock)', { description: denuncia.protocolo })}
          >
            <HelpCircle className="size-3.5 shrink-0" aria-hidden />
            Solicitar mais info
          </Button>
          <Button
            type="button"
            variant="outline"
            className="text-destructive hover:text-destructive h-9 flex-1 gap-1.5 text-xs sm:min-w-[9rem]"
            onClick={() =>
              toast.message('Encerrar — improcedente / insuficiente (mock)', { description: 'Fundamentação obrigatória em produção.' })
            }
          >
            <Ban className="size-3.5 shrink-0" aria-hidden />
            Encerrar (improcedente)
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-[11px]">Prioridade operacional (SLA)</Label>
            <Select value={prioridade} onValueChange={(v) => setPrioridade(v as typeof prioridade)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="P1">P1 — crítico</SelectItem>
                <SelectItem value="P2">P2 — alto</SelectItem>
                <SelectItem value="P3">P3 — médio</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="border-border/50 bg-muted/25 flex flex-col justify-center rounded-lg border px-3 py-2">
            <p className="text-muted-foreground text-[10px] font-semibold uppercase">Score de risco</p>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-foreground text-2xl font-semibold tabular-nums">{score}</span>
              <span className="text-muted-foreground mb-0.5 text-xs">/ 100 (consolidado mock)</span>
            </div>
            <Progress value={score} className="mt-2 h-1.5" />
          </div>
        </div>
      </InvestigacaoWorkspaceSecao>

      <InvestigacaoWorkspaceSecao
        variant="formulario"
        density="compact"
        titulo="Sugestão IA (opcional)"
        subtitulo="Simulação — rever sempre antes de decidir."
        tituloIcon={<Sparkles className="size-[1rem] sm:size-[1.05rem]" strokeWidth={2} aria-hidden />}
      >
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() =>
              toast.message('IA: consistência do relato', { description: 'Sem inconsistências fortes detetadas (mock).' })
            }
          >
            Validar consistência
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() => toast.message('IA: categoria/risco', { description: 'Alinhar com painel de classificação na receção.' })}
          >
            Confirmar categoria/risco
          </Button>
        </div>
      </InvestigacaoWorkspaceSecao>

      <InvestigacaoWorkspaceSecao
        variant="formulario"
        density="compact"
        titulo="Transições do fluxo"
        subtitulo="Ligação ao diagrama em Workflows."
        tituloIcon={<Link2 className="size-[1rem] sm:size-[1.05rem]" strokeWidth={2} aria-hidden />}
      >
        {transitions.length === 0 ? (
          <p className="text-muted-foreground text-xs">Nenhuma saída definida neste nó.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {transitions.map((t) => (
              <Button
                key={t.edgeId}
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={() =>
                  toast.message(`Transição «${t.label}»`, { description: `Para ${t.targetLabel}` })
                }
              >
                {t.label}
                <span className="text-muted-foreground">→</span>
                {t.targetLabel}
              </Button>
            ))}
          </div>
        )}
      </InvestigacaoWorkspaceSecao>
    </>
  )
}

function TriagemLateral() {
  const rows = [
    { acao: 'Consistência', ok: true },
    { acao: 'Categoria / risco', ok: true },
    { acao: 'Prioridade SLA', ok: false },
    { acao: 'Conflito de interesse', ok: true },
  ]
  return (
    <InvestigacaoWorkspaceSecao
      variant="formulario"
      density="compact"
      titulo="Checklist de triagem"
      subtitulo="Checklist operacional (mock)."
      tituloIcon={<ListChecks className="size-[1rem] sm:size-[1.05rem]" strokeWidth={2} aria-hidden />}
    >
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.acao} className="flex items-center justify-between gap-2 text-xs">
            <span>{r.acao}</span>
            <Badge variant={r.ok ? 'secondary' : 'outline'} className="h-5 text-[10px]">
              {r.ok ? 'OK' : 'Pendente'}
            </Badge>
          </li>
        ))}
      </ul>
      <p className="text-muted-foreground border-border/40 mt-2 border-t pt-2 text-[11px] leading-snug">
        Regra crítica: ao avançar para investigação, o registo passa a <strong className="text-foreground font-medium">caso formal</strong>.
      </p>
    </InvestigacaoWorkspaceSecao>
  )
}

function InvestigacaoCentro() {
  type NovoItemKanbanErrors = Partial<
    Record<'titulo' | 'responsavel' | 'dataPrevista' | 'evidenciaConclusao', string>
  >
  const [tab, setTab] = useState<'kanban' | 'lista'>('kanban')
  const [formAberto, setFormAberto] = useState(false)
  const [responsavelAberto, setResponsavelAberto] = useState(false)
  const [novoTitulo, setNovoTitulo] = useState('')
  const [novaDescricao, setNovaDescricao] = useState('')
  const [novoResponsavel, setNovoResponsavel] = useState('')
  const [novaDataPrevista, setNovaDataPrevista] = useState('')
  const [novaEvidenciaConclusao, setNovaEvidenciaConclusao] = useState(false)
  const [novoItemErros, setNovoItemErros] = useState<NovoItemKanbanErrors>({})
  const [utilizadoresInternos, setUtilizadoresInternos] = useState<UserListItemDto[]>([])
  const [kanbanItems, setKanbanItems] = useState<
    Array<{
      id: string
      titulo: string
      descricao: string
      responsavel: string
      dataPrevista: string
      evidenciaConclusao: boolean
      coluna: 'A fazer' | 'Em curso' | 'Concluído'
    }>
  >([
    {
      id: 'kanban-1',
      titulo: 'Entrevista RH',
      descricao: 'Alinhar contexto com a equipa de RH.',
      responsavel: 'Ana Ribeiro',
      dataPrevista: '',
      evidenciaConclusao: false,
      coluna: 'Em curso',
    },
    {
      id: 'kanban-2',
      titulo: 'Recolher logs de acesso',
      descricao: 'Consolidar trilha de auditoria para análise.',
      responsavel: '',
      dataPrevista: '',
      evidenciaConclusao: false,
      coluna: 'A fazer',
    },
  ])
  const [anexos, setAnexos] = useState<File[]>([])
  const [dragAtivo, setDragAtivo] = useState(false)
  const [comentarios, setComentarios] = useState<Array<{ id: string; autor: string; quando: string; texto: string }>>([
    {
      id: 'comentario-1',
      autor: 'Ana Ribeiro',
      quando: new Date().toISOString(),
      texto: 'Checklist inicial alinhado com RH.',
    },
  ])
  const [novoComentario, setNovoComentario] = useState('')

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

  const opcoesResponsavelInterno = useMemo(
    () =>
      utilizadoresInternos.map((u) => ({
        id: u.id,
        nome: u.name,
        detalhe: u.email,
        busca: `${u.name} ${u.email} ${u.perfil?.name ?? ''}`,
      })),
    [utilizadoresInternos],
  )
  const novaDataPrevistaParsed = useMemo(() => {
    if (!novaDataPrevista) return undefined
    const data = parse(novaDataPrevista, 'yyyy-MM-dd', new Date())
    return isValid(data) ? data : undefined
  }, [novaDataPrevista])

  const guardarNovoItemKanban = useCallback(() => {
    const titulo = novoTitulo.trim()
    const erros: NovoItemKanbanErrors = {}
    if (!titulo) erros.titulo = 'Informe o título.'
    if (!novoResponsavel.trim()) erros.responsavel = 'Selecione um responsável.'
    if (!novaDataPrevista) erros.dataPrevista = 'Selecione a data prevista.'
    if (!novaEvidenciaConclusao) erros.evidenciaConclusao = 'Marque a evidência de conclusão.'

    if (Object.keys(erros).length > 0) {
      setNovoItemErros(erros)
      return
    }

    setKanbanItems((prev) => [
      ...prev,
      {
        id: `kanban-${Date.now()}`,
        titulo,
        descricao: novaDescricao.trim(),
        responsavel: novoResponsavel.trim(),
        dataPrevista: novaDataPrevista,
        evidenciaConclusao: novaEvidenciaConclusao,
        coluna: 'A fazer',
      },
    ])

    setNovoTitulo('')
    setNovaDescricao('')
    setNovoResponsavel('')
    setNovaDataPrevista('')
    setNovaEvidenciaConclusao(false)
    setNovoItemErros({})
    setFormAberto(false)
    toast.success('Item criado no Kanban.')
  }, [novoTitulo, novaDescricao, novoResponsavel, novaDataPrevista, novaEvidenciaConclusao])

  const formatarDataPrevista = useCallback((valor: string) => {
    if (!valor) return 'Sem data'
    const data = parse(valor, 'yyyy-MM-dd', new Date())
    if (!isValid(data)) return 'Sem data'
    return format(data, 'dd/MM/yyyy')
  }, [])

  const adicionarAnexos = useCallback((arquivos: FileList | File[]) => {
    const lista = Array.from(arquivos)
    if (lista.length === 0) return
    setAnexos((prev) => [...prev, ...lista])
  }, [])

  const formatarTamanhoArquivo = useCallback((bytes: number) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
    const unidades = ['B', 'KB', 'MB', 'GB']
    const indice = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), unidades.length - 1)
    const valor = bytes / 1024 ** indice
    return `${valor >= 10 || indice === 0 ? valor.toFixed(0) : valor.toFixed(1)} ${unidades[indice]}`
  }, [])

  const removerAnexo = useCallback((indice: number) => {
    setAnexos((prev) => prev.filter((_, i) => i !== indice))
  }, [])

  const formatoDataComentario = useCallback((valor: string) => {
    const data = new Date(valor)
    if (!isValid(data)) return ''
    return format(data, 'dd/MM/yyyy HH:mm', { locale: ptBR })
  }, [])

  const publicarComentario = useCallback(() => {
    const texto = novoComentario.trim()
    if (!texto) return
    setComentarios((prev) => [
      ...prev,
      {
        id: `comentario-${Date.now()}`,
        autor: 'Investigador',
        quando: new Date().toISOString(),
        texto,
      },
    ])
    setNovoComentario('')
    toast.success('Comentário publicado.')
  }, [novoComentario])

  const statusBadgeClasses: Record<'A fazer' | 'Em curso' | 'Concluído', string> = {
    'A fazer': 'border-sky-200/70 bg-sky-100/80 text-sky-800 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-200',
    'Em curso':
      'border-amber-200/80 bg-amber-100/80 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200',
    Concluído:
      'border-emerald-200/80 bg-emerald-100/80 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200',
  }
  const kanbanColumnMeta: Record<
    'A fazer' | 'Em curso' | 'Concluído',
    { icon: typeof CircleDashed; tone: string; pill: string; emptyText: string }
  > = {
    'A fazer': {
      icon: CircleDashed,
      tone: 'text-sky-700 dark:text-sky-300',
      pill: 'border-sky-200/70 bg-sky-100/80 text-sky-800 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-200',
      emptyText: 'Nenhum item pendente',
    },
    'Em curso': {
      icon: Play,
      tone: 'text-amber-700 dark:text-amber-300',
      pill: 'border-amber-200/80 bg-amber-100/80 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200',
      emptyText: 'Sem tarefas em andamento',
    },
    Concluído: {
      icon: CheckCircle2,
      tone: 'text-emerald-700 dark:text-emerald-300',
      pill: 'border-emerald-200/80 bg-emerald-100/80 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200',
      emptyText: 'Ainda sem concluídos',
    },
  }

  return (
    <>
      <InvestigacaoWorkspaceSecao
        variant="formulario"
        titulo="Tarefas investigativas"
        subtitulo="Kanban mock — arrastar será ligado à API."
        tituloIcon={<Kanban className="size-[1.05rem] sm:size-[1.15rem]" strokeWidth={2} aria-hidden />}
      >
        <div className="border-border/50 bg-muted/20 flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2">
          <div className="min-w-0">
            <p className="text-foreground text-xs font-semibold">Quadro de execução</p>
            <p className="text-muted-foreground text-[11px]">Gerencie e priorize os itens da investigação.</p>
          </div>
          <div className="flex items-center gap-1.5">
            <ToggleGroup
              type="single"
              value={tab}
              onValueChange={(v) => {
                if (v === 'kanban' || v === 'lista') setTab(v)
              }}
              className="h-8 rounded-md bg-muted/30 p-0.5"
              variant="outline"
              size="sm"
              spacing={1}
              aria-label="Selecionar vista das tarefas"
            >
              <ToggleGroupItem value="kanban" className="h-7 w-7 p-0" aria-label="Vista Kanban" title="Kanban">
                <Kanban className="size-3.5" aria-hidden />
              </ToggleGroupItem>
              <ToggleGroupItem value="lista" className="h-7 w-7 p-0" aria-label="Vista Lista" title="Lista">
                <ListChecks className="size-3.5" aria-hidden />
              </ToggleGroupItem>
            </ToggleGroup>
            <Button
              type="button"
              size="icon"
              variant={formAberto ? 'secondary' : 'default'}
              className="h-8 w-8"
              aria-label={formAberto ? 'Fechar formulário de novo item' : 'Novo item'}
              title={formAberto ? 'Fechar formulário de novo item' : 'Novo item'}
              onClick={() =>
                setFormAberto((prev) => {
                  if (prev) setNovoItemErros({})
                  return !prev
                })
              }
            >
              <Plus className="size-3.5 shrink-0" aria-hidden />
            </Button>
          </div>
        </div>
        {formAberto ? (
          <div className="border-border/60 bg-muted/20 space-y-3 rounded-lg border p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-[11px]">Título *</Label>
                <Input
                  className={cn('h-8 text-xs', novoItemErros.titulo && 'border-destructive/60 focus-visible:ring-destructive/30')}
                  aria-invalid={novoItemErros.titulo ? 'true' : undefined}
                  value={novoTitulo}
                  onChange={(e) => {
                    setNovoTitulo(e.target.value)
                    if (novoItemErros.titulo) setNovoItemErros((prev) => ({ ...prev, titulo: undefined }))
                  }}
                  placeholder="Ex.: Solicitar documentos de auditoria"
                />
                {novoItemErros.titulo ? <p className="text-destructive text-[10px]">{novoItemErros.titulo}</p> : null}
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-[11px]">Descrição</Label>
                <Textarea
                  className="min-h-[72px] text-xs"
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  placeholder="Contexto e próximos passos..."
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Responsável *</Label>
                <Popover open={responsavelAberto} onOpenChange={setResponsavelAberto}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={responsavelAberto}
                      aria-invalid={novoItemErros.responsavel ? 'true' : undefined}
                      className={cn(
                        'h-8 w-full justify-between px-2 text-xs font-normal',
                        novoItemErros.responsavel && 'border-destructive/60 focus-visible:ring-destructive/30',
                      )}
                    >
                      <span className="truncate">{novoResponsavel || 'Selecionar utilizador interno'}</span>
                      <Users className="text-muted-foreground size-3.5 shrink-0 opacity-80" aria-hidden />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar utilizador interno..." />
                      <CommandList>
                        <CommandEmpty>Nenhum utilizador interno disponível</CommandEmpty>
                        <CommandGroup>
                          {opcoesResponsavelInterno.map((utilizador) => (
                            <CommandItem
                              key={utilizador.id}
                              value={utilizador.busca}
                              onSelect={() => {
                                setNovoResponsavel(utilizador.nome)
                                if (novoItemErros.responsavel) {
                                  setNovoItemErros((prev) => ({ ...prev, responsavel: undefined }))
                                }
                                setResponsavelAberto(false)
                              }}
                              className="text-xs"
                            >
                              <div className="flex min-w-0 flex-col">
                                <span className="truncate">{utilizador.nome}</span>
                                <span className="text-muted-foreground truncate text-[10px]">{utilizador.detalhe}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {novoItemErros.responsavel ? (
                  <p className="text-destructive text-[10px]">{novoItemErros.responsavel}</p>
                ) : null}
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Data prevista *</Label>
                <Popover>
                  <InputGroup className="shadow-none">
                    <InputGroupAddon align="inline-start" className="text-muted-foreground">
                      <CalendarDays className="size-3.5 shrink-0" aria-hidden />
                    </InputGroupAddon>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        data-slot="input-group-control"
                        aria-invalid={novoItemErros.dataPrevista ? 'true' : undefined}
                        className={cn(
                          'h-8 min-h-8 w-full min-w-0 flex-1 justify-start rounded-none border-0 bg-transparent px-2 py-0 text-xs font-normal shadow-none',
                          'focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0',
                          !novaDataPrevistaParsed && 'text-muted-foreground',
                          novoItemErros.dataPrevista && 'rounded-md border border-destructive/60',
                        )}
                      >
                        <span className="min-w-0 truncate">
                          {novaDataPrevistaParsed
                            ? format(novaDataPrevistaParsed, 'dd/MM/yyyy', { locale: ptBR })
                            : 'Selecionar data prevista'}
                        </span>
                      </Button>
                    </PopoverTrigger>
                  </InputGroup>
                  <PopoverContent
                    align="start"
                    sideOffset={6}
                    className="w-auto max-w-[calc(100vw-1.5rem)] p-0"
                    collisionPadding={12}
                  >
                    <Calendar
                      mode="single"
                      locale={ptBR}
                      captionLayout="label"
                      selected={novaDataPrevistaParsed}
                      defaultMonth={novaDataPrevistaParsed ?? new Date()}
                      onSelect={(d) => {
                        if (!d) return
                        setNovaDataPrevista(format(d, 'yyyy-MM-dd'))
                        if (novoItemErros.dataPrevista) {
                          setNovoItemErros((prev) => ({ ...prev, dataPrevista: undefined }))
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
                {novoItemErros.dataPrevista ? (
                  <p className="text-destructive text-[10px]">{novoItemErros.dataPrevista}</p>
                ) : null}
              </div>
              <div className="sm:col-span-2">
                <div
                  className={cn(
                    'flex items-center gap-2 rounded-md border border-border/50 px-2 py-1.5',
                    novoItemErros.evidenciaConclusao && 'border-destructive/60',
                  )}
                >
                  <Switch
                    id="nova-evidencia-conclusao"
                    checked={novaEvidenciaConclusao}
                    onCheckedChange={(checked) => {
                      setNovaEvidenciaConclusao(checked)
                      if (checked && novoItemErros.evidenciaConclusao) {
                        setNovoItemErros((prev) => ({ ...prev, evidenciaConclusao: undefined }))
                      }
                    }}
                    aria-invalid={novoItemErros.evidenciaConclusao ? 'true' : undefined}
                    aria-label="Evidência de conclusão"
                  />
                  <Label htmlFor="nova-evidencia-conclusao" className="cursor-pointer text-[11px]">
                    Evidência de conclusão obrigatório
                  </Label>
                </div>
                {novoItemErros.evidenciaConclusao ? (
                  <p className="text-destructive mt-1 text-[10px]">{novoItemErros.evidenciaConclusao}</p>
                ) : null}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs"
                onClick={() => {
                  setNovoItemErros({})
                  setFormAberto(false)
                }}
              >
                <X className="size-3.5 shrink-0" aria-hidden />
                Cancelar
              </Button>
              <Button type="button" size="sm" className="h-8 gap-1.5 text-xs" onClick={guardarNovoItemKanban}>
                <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
                Salvar item
              </Button>
            </div>
          </div>
        ) : null}
        {tab === 'kanban' ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(['A fazer', 'Em curso', 'Concluído'] as const).map((col) => {
                const itensColuna = kanbanItems.filter((item) => item.coluna === col)
                const colunaMeta = kanbanColumnMeta[col]
                const StatusIcon = colunaMeta.icon
                return (
                  <div key={col} className="border-border/50 bg-muted/15 rounded-lg border p-2">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className={cn('flex items-center gap-1 text-[10px] font-semibold uppercase', colunaMeta.tone)}>
                        <StatusIcon className="size-3" aria-hidden />
                        {col}
                      </p>
                      <Badge variant="outline" className={cn('h-5 border text-[10px]', colunaMeta.pill)}>
                        {itensColuna.length}
                      </Badge>
                    </div>
                    <div className="space-y-1.5">
                      {itensColuna.length === 0 ? (
                        <p className="text-muted-foreground rounded border border-dashed border-border/50 px-2 py-1.5 text-[11px]">
                          {colunaMeta.emptyText}
                        </p>
                      ) : (
                        itensColuna.map((item) => (
                          <div key={item.id} className="bg-background border-border/60 space-y-1 rounded border px-2 py-1.5 text-[11px]">
                            <p className="text-foreground line-clamp-2 font-medium">{item.titulo}</p>
                            <div className="text-muted-foreground space-y-0.5 text-[10px]">
                              <p className="flex items-center gap-1">
                                <UserRound className="size-2.5 shrink-0" aria-hidden />
                                <span className="truncate">Resp.: {item.responsavel || '—'}</span>
                              </p>
                              <p className="flex items-center gap-1">
                                <CalendarDays className="size-2.5 shrink-0" aria-hidden />
                                <span>Prev.: {formatarDataPrevista(item.dataPrevista)}</span>
                              </p>
                              <p className="flex items-center gap-1">
                                <BadgeCheck className="size-2.5 shrink-0" aria-hidden />
                                <span>{item.evidenciaConclusao ? 'Com evidência' : 'Sem evidência'}</span>
                              </p>
                            </div>
                            <Badge
                              variant={item.evidenciaConclusao ? 'secondary' : 'outline'}
                              className="h-4 w-fit px-1.5 text-[9px]"
                            >
                              {item.evidenciaConclusao ? 'Com evidência' : 'Sem evidência'}
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto rounded-md border border-border/50">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Título</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Responsável</TableHead>
                  <TableHead className="text-xs">Data prevista</TableHead>
                  <TableHead className="text-xs">Evidência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kanbanItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground text-xs">
                      Sem itens
                    </TableCell>
                  </TableRow>
                ) : (
                  kanbanItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs font-medium">{item.titulo}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('h-5 text-[10px]', statusBadgeClasses[item.coluna])}>
                          {item.coluna}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        <span className="inline-flex items-center gap-1">
                          <UserRound className="size-3" aria-hidden />
                          {item.responsavel || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="tabular-nums text-xs">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="size-3" aria-hidden />
                          {formatarDataPrevista(item.dataPrevista)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.evidenciaConclusao ? 'secondary' : 'outline'} className="h-5 gap-1 text-[10px]">
                          <BadgeCheck className="size-3" aria-hidden />
                          {item.evidenciaConclusao ? 'Com evidência' : 'Sem evidência'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </InvestigacaoWorkspaceSecao>

      <InvestigacaoWorkspaceSecao
        variant="formulario"
        density="compact"
        titulo="Evidências"
        subtitulo="Upload estruturado + cadeia de custódia (mock)."
        tituloIcon={<Upload className="size-[1rem] sm:size-[1.05rem]" strokeWidth={2} aria-hidden />}
      >
        <div
          className={cn(
            'border-border/60 bg-muted/20 hover:bg-muted/30 rounded-lg border border-dashed p-3 transition-colors',
            dragAtivo && 'border-primary bg-primary/5',
          )}
          onDragOver={(event) => {
            event.preventDefault()
            setDragAtivo(true)
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            setDragAtivo(false)
          }}
          onDrop={(event) => {
            event.preventDefault()
            setDragAtivo(false)
            if (event.dataTransfer.files.length > 0) adicionarAnexos(event.dataTransfer.files)
          }}
        >
          <input
            id="investigacao-evidencias-input"
            type="file"
            multiple
            className="sr-only"
            onChange={(event) => {
              if (event.target.files) {
                adicionarAnexos(event.target.files)
                event.target.value = ''
              }
            }}
          />
          <label htmlFor="investigacao-evidencias-input" className="flex cursor-pointer flex-col items-center gap-2 text-center">
            <Upload className={cn('text-muted-foreground size-4', dragAtivo && 'text-primary')} aria-hidden />
            <p className="text-muted-foreground text-xs">Arraste arquivos aqui ou clique para selecionar</p>
            <Button type="button" size="sm" variant="secondary" className="h-8 gap-1 text-xs" asChild>
              <span>Selecionar anexos</span>
            </Button>
          </label>
        </div>

        {anexos.length > 0 ? (
          <div className="space-y-1.5">
            {anexos.map((arquivo, indice) => (
              <div
                key={`${arquivo.name}-${arquivo.lastModified}-${indice}`}
                className="border-border/50 bg-background flex items-center justify-between gap-2 rounded-md border px-2 py-1.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">{arquivo.name}</p>
                  <p className="text-muted-foreground truncate text-[10px]">
                    {formatarTamanhoArquivo(arquivo.size)}
                    {arquivo.type ? ` • ${arquivo.type}` : ''}
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground size-7"
                  aria-label={`Remover anexo ${arquivo.name}`}
                  onClick={() => removerAnexo(indice)}
                >
                  <X className="size-3.5" aria-hidden />
                </Button>
              </div>
            ))}
          </div>
        ) : null}
        <p className="text-muted-foreground text-[10px]">Os anexos ficam apenas nesta sessão local.</p>
      </InvestigacaoWorkspaceSecao>

      <InvestigacaoWorkspaceSecao
        variant="formulario"
        density="compact"
        titulo="Comentários internos"
        subtitulo="Menções @ quando integradas."
        tituloIcon={<MessageSquare className="size-[1rem] sm:size-[1.05rem]" strokeWidth={2} aria-hidden />}
      >
        <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
          {comentarios.map((comentario) => (
            <div key={comentario.id} className="border-border/40 flex gap-1.5 border-l-2 pl-2">
              <UserRound className="text-muted-foreground mt-0.5 size-3.5 shrink-0" aria-hidden />
              <div>
                <p className="text-[10px] leading-tight">
                  <span className="text-foreground font-medium">{comentario.autor}</span>
                  <span className="text-muted-foreground tabular-nums"> · {formatoDataComentario(comentario.quando)}</span>
                </p>
                <p className="text-foreground mt-0.5 text-xs leading-snug">{comentario.texto}</p>
              </div>
            </div>
          ))}
        </div>
        <Textarea
          placeholder="Comentário… @utilizador"
          value={novoComentario}
          onChange={(event) => setNovoComentario(event.target.value)}
          className="min-h-[52px] text-xs"
        />
        <div className="flex justify-end">
          <Button type="button" size="sm" className="h-7 px-2 text-xs" onClick={publicarComentario}>
            Publicar
            <SendHorizontal className="size-3.5" data-icon="inline-end" aria-hidden />
          </Button>
        </div>
      </InvestigacaoWorkspaceSecao>
    </>
  )
}

function InvestigacaoLateral() {
  const [utilizadoresInternos, setUtilizadoresInternos] = useState<UserListItemDto[]>([])
  const [principalAberto, setPrincipalAberto] = useState(false)
  const [apoioAberto, setApoioAberto] = useState(false)
  const [tipoApoio, setTipoApoio] = useState<'EQUIPE' | 'USUARIO_ESPECIFICO'>('USUARIO_ESPECIFICO')
  const [investigadorPrincipal, setInvestigadorPrincipal] = useState('Ana Ribeiro')
  const [equipeApoio, setEquipeApoio] = useState('')
  const [investigadorApoioIds, setInvestigadorApoioIds] = useState<string[]>([])

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

  const opcoesUtilizadorInterno = useMemo(
    () =>
      utilizadoresInternos.map((u) => ({
        id: u.id,
        nome: u.name,
        detalhe: u.email,
        busca: `${u.name} ${u.email} ${u.perfil?.name ?? ''}`,
      })),
    [utilizadoresInternos],
  )
  const apoiosSelecionados = useMemo(
    () => opcoesUtilizadorInterno.filter((utilizador) => investigadorApoioIds.includes(utilizador.id)),
    [opcoesUtilizadorInterno, investigadorApoioIds],
  )

  return (
    <>
      <InvestigacaoWorkspaceSecao
        variant="formulario"
        density="compact"
        titulo="Responsáveis"
        subtitulo="Papéis e cobertura da investigação."
        tituloIcon={<UserCheck className="size-[1rem] sm:size-[1.05rem]" strokeWidth={2} aria-hidden />}
      >
        <div className="space-y-2 text-xs">
          <div className="space-y-1">
            <Label className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wide">Principal</Label>
            <Popover open={principalAberto} onOpenChange={setPrincipalAberto}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={principalAberto}
                  className="h-8 w-full justify-between px-2 text-xs font-normal"
                >
                  <span className="truncate">{investigadorPrincipal || 'Selecionar utilizador interno'}</span>
                  <Users className="text-muted-foreground size-3.5 shrink-0 opacity-80" aria-hidden />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput placeholder="Buscar utilizador interno..." />
                  <CommandList>
                    <CommandEmpty>Nenhum utilizador encontrado</CommandEmpty>
                    <CommandGroup>
                      {opcoesUtilizadorInterno.map((utilizador) => (
                        <CommandItem
                          key={utilizador.id}
                          value={utilizador.busca}
                          onSelect={() => {
                            setInvestigadorPrincipal(utilizador.nome)
                            setPrincipalAberto(false)
                          }}
                          className="text-xs"
                        >
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate">{utilizador.nome}</span>
                            <span className="text-muted-foreground truncate text-[10px]">{utilizador.detalhe}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wide">Apoio</Label>
            <ToggleGroup
              type="single"
              value={tipoApoio}
              onValueChange={(v) => {
                if (v === 'EQUIPE' || v === 'USUARIO_ESPECIFICO') setTipoApoio(v)
              }}
              variant="outline"
              size="sm"
              spacing={1}
              className="w-fit rounded-md bg-muted/30 p-0.5"
              aria-label="Tipo de apoio"
            >
              <ToggleGroupItem
                value="EQUIPE"
                className="h-7 gap-1.5 px-2.5 text-[11px] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground dark:data-[state=on]:bg-primary dark:data-[state=on]:text-primary-foreground"
              >
                <Users className="size-3" aria-hidden />
                Equipe
              </ToggleGroupItem>
              <ToggleGroupItem
                value="USUARIO_ESPECIFICO"
                className="h-7 gap-1.5 px-2.5 text-[11px] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground dark:data-[state=on]:bg-primary dark:data-[state=on]:text-primary-foreground"
              >
                <UserRound className="size-3" aria-hidden />
                Usuário
              </ToggleGroupItem>
            </ToggleGroup>
            {tipoApoio === 'EQUIPE' ? (
              <Select value={equipeApoio} onValueChange={setEquipeApoio}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Selecionar equipe de apoio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compliance">Equipe de Compliance</SelectItem>
                  <SelectItem value="juridico">Equipe Jurídica</SelectItem>
                  <SelectItem value="auditoria">Equipe de Auditoria Interna</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <>
                <Popover open={apoioAberto} onOpenChange={setApoioAberto}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={apoioAberto}
                      className="h-8 w-full justify-between px-2 text-xs font-normal"
                    >
                      <span className="truncate">
                        {apoiosSelecionados.length > 0
                          ? `${apoiosSelecionados.length} selecionado${apoiosSelecionados.length > 1 ? 's' : ''}`
                          : 'Selecionar apoio'}
                      </span>
                      <Users className="text-muted-foreground size-3.5 shrink-0 opacity-80" aria-hidden />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar usuário..." />
                      <CommandList>
                        <CommandEmpty>Nenhum utilizador encontrado</CommandEmpty>
                        <CommandGroup>
                          {opcoesUtilizadorInterno.map((utilizador) => (
                            <CommandItem
                              key={utilizador.id}
                              value={utilizador.busca}
                              onSelect={() => {
                                setInvestigadorApoioIds((prev) =>
                                  prev.includes(utilizador.id)
                                    ? prev.filter((id) => id !== utilizador.id)
                                    : [...prev, utilizador.id],
                                )
                              }}
                              className="text-xs"
                            >
                              <div className="flex min-w-0 flex-1 flex-col">
                                <span className="truncate">{utilizador.nome}</span>
                                <span className="text-muted-foreground truncate text-[10px]">{utilizador.detalhe}</span>
                              </div>
                              {investigadorApoioIds.includes(utilizador.id) ? (
                                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                                  Selecionado
                                </Badge>
                              ) : null}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {apoiosSelecionados.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {apoiosSelecionados.map((apoio) => (
                      <Badge key={apoio.id} variant="secondary" className="h-6 gap-1 px-2 text-[10px]">
                        <span className="max-w-[9.5rem] truncate">{apoio.nome}</span>
                        <button
                          type="button"
                          aria-label={`Remover ${apoio.nome}`}
                          className="text-muted-foreground hover:text-foreground inline-flex items-center"
                          onClick={() => setInvestigadorApoioIds((prev) => prev.filter((id) => id !== apoio.id))}
                        >
                          <X className="size-3" aria-hidden />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </InvestigacaoWorkspaceSecao>
    </>
  )
}

function AnaliseCentro({
  investigation,
  onInvestigationUpdated,
}: Readonly<{
  investigation?: InvestigationDto | null
  onInvestigationUpdated?: (inv: InvestigationDto) => void
}>) {
  const [factsSummary, setFactsSummary] = useState('')
  const [legalBasis, setLegalBasis] = useState('')
  const [outcome, setOutcome] = useState<'PROCEDENTE' | 'IMPROCEDENTE' | 'PARCIAL'>('PARCIAL')
  const [impactFinancial, setImpactFinancial] = useState(false)
  const [impactReputational, setImpactReputational] = useState(false)
  const [impactRegulatory, setImpactRegulatory] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!investigation) return
    setFactsSummary(investigation.factsSummary ?? '')
    setLegalBasis(investigation.legalBasis ?? '')
    if (
      investigation.outcome === 'PROCEDENTE' ||
      investigation.outcome === 'IMPROCEDENTE' ||
      investigation.outcome === 'PARCIAL'
    ) {
      setOutcome(investigation.outcome)
    }
    setImpactFinancial(investigation.impactFinancial)
    setImpactReputational(investigation.impactReputational)
    setImpactRegulatory(investigation.impactRegulatory)
  }, [investigation])

  const guardarAnalise = useCallback(async () => {
    if (!investigation?.id) return
    setSaving(true)
    try {
      const updated = await updateInvestigation(investigation.id, {
        factsSummary: factsSummary.trim(),
        legalBasis: legalBasis.trim(),
        outcome,
        impactFinancial,
        impactReputational,
        impactRegulatory,
      })
      onInvestigationUpdated?.(updated)
      toast.success('Análise guardada.')
    } catch {
      toast.error('Erro ao guardar análise.')
    } finally {
      setSaving(false)
    }
  }, [
    investigation?.id,
    factsSummary,
    legalBasis,
    outcome,
    impactFinancial,
    impactReputational,
    impactRegulatory,
    onInvestigationUpdated,
  ])

  return (
    <>
      <InvestigacaoWorkspaceSecao
        variant="formulario"
        titulo="Análise final estruturada"
        subtitulo="Secções fixas para padronizar relatório e auditoria."
        tituloIcon={<Scale className="size-[1.05rem] sm:size-[1.15rem]" strokeWidth={2} aria-hidden />}
      >
        <div className="space-y-2">
          <Label className="text-[11px]">Síntese dos factos</Label>
          <Textarea
            className="min-h-[56px] text-xs"
            placeholder="Resumo factual da investigação"
            value={factsSummary}
            onChange={(e) => setFactsSummary(e.target.value)}
          />
          <Label className="text-[11px]">Fundamentação jurídica / política</Label>
          <Textarea
            className="min-h-[56px] text-xs"
            placeholder="Políticas e base normativa"
            value={legalBasis}
            onChange={(e) => setLegalBasis(e.target.value)}
          />
        </div>
      </InvestigacaoWorkspaceSecao>
      <InvestigacaoWorkspaceSecao
        variant="formulario"
        density="compact"
        titulo="Classificação do resultado"
        tituloIcon={<Gavel className="size-[1rem] sm:size-[1.05rem]" strokeWidth={2} aria-hidden />}
      >
        <Select value={outcome} onValueChange={(v) => setOutcome(v as typeof outcome)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PROCEDENTE">Procedente</SelectItem>
            <SelectItem value="IMPROCEDENTE">Improcedente</SelectItem>
            <SelectItem value="PARCIAL">Parcialmente procedente</SelectItem>
          </SelectContent>
        </Select>
        <div className="mt-3 space-y-1.5">
          <p className="text-muted-foreground text-[10px] font-semibold uppercase">Impacto</p>
          <label className="flex items-center gap-2 text-[11px]">
            <Checkbox checked={impactFinancial} onCheckedChange={(v) => setImpactFinancial(Boolean(v))} />
            Financeiro
          </label>
          <label className="flex items-center gap-2 text-[11px]">
            <Checkbox checked={impactReputational} onCheckedChange={(v) => setImpactReputational(Boolean(v))} />
            Reputacional
          </label>
          <label className="flex items-center gap-2 text-[11px]">
            <Checkbox checked={impactRegulatory} onCheckedChange={(v) => setImpactRegulatory(Boolean(v))} />
            Regulatório
          </label>
        </div>
        <div className="flex justify-end">
          <Button type="button" size="sm" className="h-8 text-xs" onClick={guardarAnalise} disabled={saving || !investigation?.id}>
            {saving ? 'A guardar...' : 'Guardar análise'}
          </Button>
        </div>
      </InvestigacaoWorkspaceSecao>
    </>
  )
}

function AnaliseLateral() {
  return (
    <InvestigacaoWorkspaceSecao
      variant="formulario"
      density="compact"
      titulo="Vínculos"
      subtitulo="Riscos confirmados e controlos falhos."
      tituloIcon={<AlertTriangle className="size-[1rem] sm:size-[1.05rem]" strokeWidth={2} aria-hidden />}
    >
      <ul className="text-muted-foreground space-y-1.5 text-[11px] leading-snug">
        <li>• Risco reputacional — confirmado</li>
        <li>• Controlo «código de ética» — falha de divulgação (mock)</li>
      </ul>
    </InvestigacaoWorkspaceSecao>
  )
}

function PlanoCentro({ investigationId }: Readonly<{ investigationId?: string }>) {
  const [actions, setActions] = useState<CorrectiveActionDto[]>([])
  const [newDescription, setNewDescription] = useState('')
  const [newResponsible, setNewResponsible] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [loading, setLoading] = useState(false)

  const carregarAcoes = useCallback(async () => {
    if (!investigationId) return
    try {
      setLoading(true)
      const rows = await listActions(investigationId)
      setActions(rows)
    } finally {
      setLoading(false)
    }
  }, [investigationId])

  useEffect(() => {
    carregarAcoes()
  }, [carregarAcoes])

  const criarAcao = useCallback(async () => {
    if (!investigationId || !newDescription.trim()) {
      toast.message('Descreva a ação corretiva.')
      return
    }
    try {
      const row = await addAction(investigationId, {
        description: newDescription.trim(),
        responsible: newResponsible.trim(),
        dueDate: newDueDate || undefined,
        status: 'OPEN',
      })
      setActions((prev) => [...prev, row])
      setNewDescription('')
      setNewResponsible('')
      setNewDueDate('')
      toast.success('Ação criada.')
    } catch {
      toast.error('Erro ao criar ação.')
    }
  }, [investigationId, newDescription, newResponsible, newDueDate])

  const atualizarStatusAcao = useCallback(
    async (row: CorrectiveActionDto, status: CorrectiveActionDto['status']) => {
      if (!investigationId) return
      try {
        const updated = await updateAction(investigationId, row.id, {
          description: row.description,
          responsible: row.responsible ?? '',
          dueDate: row.dueDate ?? undefined,
          status,
        })
        setActions((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      } catch {
        toast.error('Erro ao atualizar ação.')
      }
    },
    [investigationId],
  )

  return (
    <>
      <InvestigacaoWorkspaceSecao
        variant="formulario"
        titulo="Ações corretivas"
        subtitulo="Backlog integrado ao backend."
        tituloIcon={<ClipboardCheck className="size-[1.05rem] sm:size-[1.15rem]" strokeWidth={2} aria-hidden />}
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">Ação</TableHead>
              <TableHead className="text-xs">Responsável</TableHead>
              <TableHead className="text-xs">Prazo</TableHead>
              <TableHead className="text-xs">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actions.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="text-xs">{row.description}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{row.responsible || '—'}</TableCell>
                <TableCell className="tabular-nums text-xs">{row.dueDate ? format(new Date(row.dueDate), 'dd/MM/yyyy') : '—'}</TableCell>
                <TableCell>
                  <Select value={row.status} onValueChange={(v) => atualizarStatusAcao(row, v as CorrectiveActionDto['status'])}>
                    <SelectTrigger className="h-7 w-32 text-[11px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Aberta</SelectItem>
                      <SelectItem value="IN_PROGRESS">Em andamento</SelectItem>
                      <SelectItem value="DONE">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
            {actions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground text-xs">
                  {loading ? 'A carregar...' : 'Sem ações registadas.'}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
        <div className="grid gap-2 sm:grid-cols-3">
          <Input className="h-8 text-xs sm:col-span-3" placeholder="Descrição da ação" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
          <Input className="h-8 text-xs" placeholder="Responsável" value={newResponsible} onChange={(e) => setNewResponsible(e.target.value)} />
          <Input className="h-8 text-xs" type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
          <Button type="button" size="sm" className="h-8 text-xs" onClick={criarAcao} disabled={!investigationId}>
            Nova ação
          </Button>
        </div>
      </InvestigacaoWorkspaceSecao>
    </>
  )
}

function PlanoLateral() {
  return (
    <InvestigacaoWorkspaceSecao
      variant="formulario"
      density="compact"
      titulo="SLA das ações"
      tituloIcon={<CalendarClock className="size-[1rem] sm:size-[1.05rem]" strokeWidth={2} aria-hidden />}
    >
      <p className="text-muted-foreground text-[11px] leading-snug">
        Indicadores por ação e alertas de atraso serão ligados ao motor de prazos.
      </p>
      <Progress value={40} className="mt-2 h-1.5" />
      <p className="text-muted-foreground mt-1 text-[10px]">40% das ações dentro do prazo (mock)</p>
    </InvestigacaoWorkspaceSecao>
  )
}

function AprovacaoCentro({
  transitions,
  investigationId,
}: Readonly<{ transitions: TransitionLite[]; investigationId?: string }>) {
  const [approvals, setApprovals] = useState<ApprovalDecisionDto[]>([])
  const [level, setLevel] = useState<'COMPLIANCE' | 'LEGAL' | 'BOARD'>('COMPLIANCE')
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | 'REVIEW'>('APPROVED')
  const [justification, setJustification] = useState('')
  const [decidedBy, setDecidedBy] = useState('')

  useEffect(() => {
    if (!investigationId) return
    listApprovals(investigationId)
      .then(setApprovals)
      .catch(() => {})
  }, [investigationId])

  const registarAprovacao = useCallback(async () => {
    if (!investigationId) return
    try {
      const created = await addApproval(investigationId, {
        level,
        levelOrder: level === 'COMPLIANCE' ? 1 : level === 'LEGAL' ? 2 : 3,
        decision,
        justification: justification.trim(),
        decidedBy: decidedBy.trim(),
      })
      setApprovals((prev) => [...prev, created])
      setJustification('')
      toast.success('Decisão registada.')
    } catch {
      toast.error('Erro ao registar decisão.')
    }
  }, [investigationId, level, decision, justification, decidedBy])

  const atualizarDecisao = useCallback(
    async (row: ApprovalDecisionDto, nextDecision: 'APPROVED' | 'REJECTED' | 'REVIEW') => {
      if (!investigationId) return
      try {
        const updated = await updateApproval(investigationId, row.id, {
          level: row.level,
          levelOrder: row.levelOrder,
          decision: nextDecision,
          justification: row.justification ?? '',
          decidedBy: row.decidedBy ?? '',
        })
        setApprovals((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      } catch {
        toast.error('Erro ao atualizar decisão.')
      }
    },
    [investigationId],
  )

  return (
    <>
      <InvestigacaoWorkspaceSecao
        variant="formulario"
        titulo="Decisão de governança"
        subtitulo="Aprovar, rejeitar ou pedir ajustes com registo persistido."
        tituloIcon={<Shield className="size-[1.05rem] sm:size-[1.15rem]" strokeWidth={2} aria-hidden />}
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <Select value={level} onValueChange={(v) => setLevel(v as typeof level)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COMPLIANCE">Compliance</SelectItem>
              <SelectItem value="LEGAL">Jurídico</SelectItem>
              <SelectItem value="BOARD">Diretoria</SelectItem>
            </SelectContent>
          </Select>
          <Select value={decision} onValueChange={(v) => setDecision(v as typeof decision)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="APPROVED">Aprovar</SelectItem>
              <SelectItem value="REJECTED">Rejeitar</SelectItem>
              <SelectItem value="REVIEW">Solicitar ajustes</SelectItem>
            </SelectContent>
          </Select>
          <Input
            className="h-8 text-xs sm:col-span-2"
            placeholder="Responsável pela decisão"
            value={decidedBy}
            onChange={(e) => setDecidedBy(e.target.value)}
          />
          <Textarea
            className="min-h-[52px] text-xs sm:col-span-2"
            placeholder="Justificativa / comentário…"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <Button type="button" size="sm" className="h-8 text-xs" onClick={registarAprovacao} disabled={!investigationId}>
            Registar decisão
          </Button>
        </div>
        <div className="space-y-1">
          {approvals.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-2 rounded border border-border/50 p-2">
              <div className="min-w-0">
                <p className="text-xs font-medium">{a.level}</p>
                <p className="text-muted-foreground text-[11px]">{a.justification || 'Sem justificativa'}</p>
              </div>
              <Select value={(a.decision ?? 'REVIEW') as 'APPROVED' | 'REJECTED' | 'REVIEW'} onValueChange={(v) => atualizarDecisao(a, v as 'APPROVED' | 'REJECTED' | 'REVIEW')}>
                <SelectTrigger className="h-7 w-28 text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVED">Aprovado</SelectItem>
                  <SelectItem value="REJECTED">Rejeitado</SelectItem>
                  <SelectItem value="REVIEW">Ajustes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </InvestigacaoWorkspaceSecao>
      <InvestigacaoWorkspaceSecao variant="formulario" density="compact" titulo="Workflow do fluxo" tituloIcon={<GitBranch className="size-[1rem] sm:size-[1.05rem]" strokeWidth={2} aria-hidden />}>
        {transitions.length === 0 ? (
          <p className="text-muted-foreground text-xs">Sem transições.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {transitions.map((t) => (
              <Button key={t.edgeId} type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => toast.message(t.label)}>
                {t.label} → {t.targetLabel}
              </Button>
            ))}
          </div>
        )}
      </InvestigacaoWorkspaceSecao>
    </>
  )
}

function AprovacaoLateral() {
  const niveis = [
    { nivel: 'Compliance', estado: 'Pendente' },
    { nivel: 'Jurídico', estado: '—' },
    { nivel: 'Diretoria', estado: '—' },
  ]
  return (
    <InvestigacaoWorkspaceSecao
      variant="formulario"
      density="compact"
      titulo="Níveis de aprovação"
      tituloIcon={<Users className="size-[1rem] sm:size-[1.05rem]" strokeWidth={2} aria-hidden />}
    >
      <ul className="space-y-2">
        {niveis.map((n) => (
          <li key={n.nivel} className="flex items-center justify-between gap-2 text-xs">
            <span>{n.nivel}</span>
            <Badge variant="outline" className="h-5 text-[10px]">
              {n.estado}
            </Badge>
          </li>
        ))}
      </ul>
      <p className="text-muted-foreground mt-2 text-[10px] leading-snug">
        Registo obrigatório: quem, quando, fundamentação (LGPD / ISO / SOX — mock).
      </p>
    </InvestigacaoWorkspaceSecao>
  )
}

type EncerramentoChecklistItemDef = {
  id: 'investigacao-concluida' | 'acoes-plano' | 'dados-finais' | 'notificar-denunciante'
  acao: string
  detalhe: string
  obrigatorio: boolean
  icon: typeof ClipboardCheck
}

function EncerramentoCheckItem({
  item,
  stepIndex,
  totalSteps,
  checked,
  active,
  onClick,
}: Readonly<{
  item: EncerramentoChecklistItemDef
  stepIndex: number
  totalSteps: number
  checked: boolean
  active: boolean
  onClick: () => void
}>) {
  const Icon = item.icon
  const isLast = stepIndex >= totalSteps - 1
  const statusLabel = checked ? 'Concluída' : item.obrigatorio ? 'Pendente' : 'Opcional'
  const statusBadgeClass = checked
    ? 'border-emerald-200/80 bg-emerald-100/80 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200'
    : item.obrigatorio
      ? 'border-amber-200/80 bg-amber-100/85 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200'
      : 'border-slate-200/80 bg-slate-100/85 text-slate-800 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-200'

  return (
    <button
      type="button"
      onClick={onClick}
      role="status"
      aria-label={`${item.acao}: ${checked ? 'concluído' : item.obrigatorio ? 'pendente' : 'opcional'}`}
      className={cn(
        'group/encerramento relative flex w-full gap-2 rounded-lg border px-1.5 py-1.5 text-left transition-[border-color,background-color,box-shadow] duration-200 motion-reduce:transition-none',
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
            <CheckCircle2 className="size-3.5" strokeWidth={2.5} />
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
      <Badge variant="outline" className={cn('h-5 self-start border px-1.5 text-[10px]', statusBadgeClass)}>
        {statusLabel}
      </Badge>
    </button>
  )
}

function EncerramentoCentro({
  investigation,
  onInvestigationUpdated,
}: Readonly<{
  investigation?: InvestigationDto | null
  onInvestigationUpdated?: (inv: InvestigationDto) => void
}>) {
  const [dataEncerramento, setDataEncerramento] = useState('')
  const [responsavelFinal, setResponsavelFinal] = useState('')
  const [closureJustification, setClosureJustification] = useState('')
  const investigacaoConcluida = true
  const acoesDefinidas = true
  const [notificarDenunciante, setNotificarDenunciante] = useState(false)
  const [checklistItemAtivo, setChecklistItemAtivo] = useState<EncerramentoChecklistItemDef['id']>('investigacao-concluida')
  const [observacaoNotificacao, setObservacaoNotificacao] = useState('')
  const [errosVisuais, setErrosVisuais] = useState<Partial<Record<'dataEncerramento' | 'responsavelFinal' | 'closureJustification', string>>>({})
  const [saving, setSaving] = useState(false)
  const dataEncerramentoParsed = useMemo(() => {
    const raw = dataEncerramento.trim()
    if (raw.length < 10) return undefined
    const d = parse(raw.slice(0, 10), 'yyyy-MM-dd', new Date())
    return isValid(d) ? d : undefined
  }, [dataEncerramento])

  useEffect(() => {
    if (!investigation) return
    setDataEncerramento(investigation.closedAt ? String(investigation.closedAt).slice(0, 10) : '')
    setClosureJustification(investigation.closureJustification ?? '')
  }, [investigation])

  const checklistConcluida = useMemo(() => {
    const obrigatorios = [investigacaoConcluida, acoesDefinidas]
    return obrigatorios.filter(Boolean).length
  }, [investigacaoConcluida, acoesDefinidas])
  const checklistPercentual = useMemo(() => Math.round((checklistConcluida / 2) * 100), [checklistConcluida])
  const checklistEncerramento = useMemo<ReadonlyArray<EncerramentoChecklistItemDef>>(
    () => [
      {
        id: 'investigacao-concluida',
        acao: 'Investigação concluída',
        detalhe: 'Confirme que a apuração foi finalizada e não há pendências de investigação.',
        obrigatorio: true,
        icon: BadgeCheck,
      },
      {
        id: 'acoes-plano',
        acao: 'Ações definidas no plano',
        detalhe: 'Valide que as ações corretivas foram definidas e registradas no plano.',
        obrigatorio: true,
        icon: ClipboardCheck,
      },
      {
        id: 'dados-finais',
        acao: 'Preencher dados finais obrigatórios',
        detalhe: 'Informe data de encerramento, responsável final e justificativa.',
        obrigatorio: true,
        icon: FileText,
      },
      {
        id: 'notificar-denunciante',
        acao: 'Notificar denunciante identificado',
        detalhe: 'Opcional: sinalize se haverá comunicação de fechamento ao denunciante identificado.',
        obrigatorio: false,
        icon: MessageSquare,
      },
    ],
    [],
  )
  const checklistStatus = useMemo<Record<EncerramentoChecklistItemDef['id'], boolean>>(
    () => ({
      'investigacao-concluida': investigacaoConcluida,
      'acoes-plano': acoesDefinidas,
      'dados-finais': Boolean(dataEncerramentoParsed && responsavelFinal.trim() && closureJustification.trim()),
      'notificar-denunciante': notificarDenunciante,
    }),
    [investigacaoConcluida, acoesDefinidas, dataEncerramentoParsed, responsavelFinal, closureJustification, notificarDenunciante],
  )
  const itemEncerramentoAtivo = useMemo(
    () => checklistEncerramento.find((item) => item.id === checklistItemAtivo) ?? checklistEncerramento[0],
    [checklistEncerramento, checklistItemAtivo],
  )

  const marcarEncerrado = useCallback(async () => {
    if (!investigation?.id) return
    setSaving(true)
    try {
      const updated = await updateInvestigation(investigation.id, {
        closedAt: dataEncerramento || new Date().toISOString(),
        closureJustification: closureJustification.trim(),
      })
      onInvestigationUpdated?.(updated)
      toast.success('Caso encerrado.')
    } catch {
      toast.error('Erro ao encerrar caso.')
    } finally {
      setSaving(false)
    }
  }, [investigation?.id, dataEncerramento, closureJustification, onInvestigationUpdated])

  const validarVisualCampos = useCallback(() => {
    const proximosErros: typeof errosVisuais = {}
    if (!dataEncerramentoParsed) proximosErros.dataEncerramento = 'Selecione a data de encerramento.'
    if (!responsavelFinal.trim()) proximosErros.responsavelFinal = 'Informe o responsável final.'
    if (!closureJustification.trim()) proximosErros.closureJustification = 'Descreva a justificativa do encerramento.'
    setErrosVisuais(proximosErros)
  }, [dataEncerramentoParsed, responsavelFinal, closureJustification])

  return (
    <>
      <InvestigacaoWorkspaceSecao
        variant="formulario"
        titulo="Validações finais"
        subtitulo="Garantir pré-requisitos antes do encerramento formal."
        tituloIcon={<ClipboardCheck className="size-[1.05rem] sm:size-[1.15rem]" strokeWidth={2} aria-hidden />}
      >
        <div className="border-border/60 bg-muted/25 space-y-2 rounded-lg border px-3 py-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-foreground text-xs font-semibold">O que validar antes de encerrar</p>
              <p className="text-muted-foreground text-[11px]">Confirme os pré-requisitos mínimos e preencha os campos obrigatórios.</p>
            </div>
            <Badge variant={checklistConcluida === 2 ? 'secondary' : 'outline'} className="h-5 text-[10px]">
              {checklistConcluida}/2 concluídos
            </Badge>
          </div>
          <Progress value={checklistPercentual} className="h-1.5" />
        </div>
        <div className="grid gap-1.5 md:grid-cols-2">
          {checklistEncerramento.map((item, index) => (
            <EncerramentoCheckItem
              key={item.id}
              item={item}
              stepIndex={index}
              totalSteps={checklistEncerramento.length}
              checked={Boolean(checklistStatus[item.id])}
              active={item.id === checklistItemAtivo}
              onClick={() => setChecklistItemAtivo(item.id)}
            />
          ))}
        </div>
        <div className="space-y-2 rounded-md border border-border/60 bg-muted/15 p-2.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {itemEncerramentoAtivo?.acao ?? 'Checklist'}
              </p>
              <p className="text-muted-foreground text-[10px] leading-tight">{itemEncerramentoAtivo?.detalhe}</p>
            </div>
            <Badge variant={checklistStatus[checklistItemAtivo] ? 'default' : 'secondary'} className="h-5 text-[10px]">
              {checklistStatus[checklistItemAtivo] ? 'Concluído' : itemEncerramentoAtivo?.obrigatorio ? 'Pendente' : 'Opcional'}
            </Badge>
          </div>
          {checklistItemAtivo === 'investigacao-concluida' ? (
            <div className="space-y-1.5 rounded-md border border-border/50 bg-background px-2 py-1.5 text-[11px]">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">Validação automática do sistema</p>
                <Badge variant={investigacaoConcluida ? 'secondary' : 'outline'} className="h-5 text-[10px]">
                  {investigacaoConcluida ? 'OK' : 'Pendente'}
                </Badge>
              </div>
              <ul className="text-muted-foreground space-y-0.5 text-[10px] leading-tight">
                <li>• Regra: etapa atual em Encerramento com trilha de investigação finalizada.</li>
                <li>• Regra: histórico com registro de conclusão da investigação.</li>
                <li>• Origem dos dados: workflow da investigação e histórico interno do caso.</li>
              </ul>
            </div>
          ) : null}
          {checklistItemAtivo === 'acoes-plano' ? (
            <div className="space-y-1.5 rounded-md border border-border/50 bg-background px-2 py-1.5 text-[11px]">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">Validação automática do sistema</p>
                <Badge variant={acoesDefinidas ? 'secondary' : 'outline'} className="h-5 text-[10px]">
                  {acoesDefinidas ? 'OK' : 'Pendente'}
                </Badge>
              </div>
              <ul className="text-muted-foreground space-y-0.5 text-[10px] leading-tight">
                <li>• Regra: existe plano de ação vinculado ao caso.</li>
                <li>• Regra: ao menos uma ação corretiva registrada no plano.</li>
                <li>• Origem dos dados: módulo de ações corretivas da investigação.</li>
              </ul>
            </div>
          ) : null}
          {checklistItemAtivo === 'notificar-denunciante' ? (
            <div className="space-y-1.5">
              <div className="border-border/50 bg-background flex items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-[11px]">
                <div className="space-y-0.5">
                  <p className="font-medium">Notificar denunciante identificado (opcional)</p>
                  <p className="text-muted-foreground text-[10px]">Ative apenas quando houver identificação e canal válido.</p>
                </div>
                <Switch
                  checked={notificarDenunciante}
                  onCheckedChange={setNotificarDenunciante}
                  aria-label="Notificar denunciante identificado"
                />
              </div>
              {notificarDenunciante ? (
                <div className="space-y-0.5">
                  <Label className="text-[11px]">Observação da notificação</Label>
                  <Input
                    className="h-8 text-xs"
                    value={observacaoNotificacao}
                    onChange={(e) => setObservacaoNotificacao(e.target.value)}
                    placeholder="Ex.: Comunicação enviada por e-mail corporativo."
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        {checklistItemAtivo === 'dados-finais' ? (
          <div className="space-y-2 rounded-md border border-border/60 bg-muted/15 p-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Dados finais obrigatórios</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-0.5">
                <Label className="text-[11px]">Data de encerramento *</Label>
                <Popover>
                  <InputGroup className="mt-0.5 shadow-none">
                    <InputGroupAddon align="inline-start" className="text-muted-foreground">
                      <CalendarDays className="size-3.5 shrink-0" aria-hidden />
                    </InputGroupAddon>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        data-slot="input-group-control"
                        aria-invalid={errosVisuais.dataEncerramento ? 'true' : undefined}
                        className={cn(
                          'h-8 min-h-8 w-full min-w-0 flex-1 justify-start rounded-none border-0 bg-transparent px-2 py-0 text-xs font-normal shadow-none',
                          'focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0',
                          !dataEncerramentoParsed && 'text-muted-foreground',
                          errosVisuais.dataEncerramento && 'rounded-md border border-destructive/60',
                        )}
                      >
                        <span className="min-w-0 truncate">
                          {dataEncerramentoParsed
                            ? format(dataEncerramentoParsed, 'dd/MM/yyyy', { locale: ptBR })
                            : 'Selecionar data'}
                        </span>
                      </Button>
                    </PopoverTrigger>
                  </InputGroup>
                  <PopoverContent
                    align="start"
                    sideOffset={6}
                    className="w-auto max-w-[calc(100vw-1.5rem)] p-0"
                    collisionPadding={12}
                  >
                    <Calendar
                      mode="single"
                      locale={ptBR}
                      captionLayout="label"
                      selected={dataEncerramentoParsed}
                      defaultMonth={dataEncerramentoParsed ?? new Date()}
                      onSelect={(d) => {
                        if (!d) return
                        setDataEncerramento(format(d, 'yyyy-MM-dd'))
                      }}
                    />
                  </PopoverContent>
                </Popover>
                {errosVisuais.dataEncerramento ? (
                  <p className="text-destructive text-[10px]">{errosVisuais.dataEncerramento}</p>
                ) : (
                  <p className="text-muted-foreground text-[10px]">Use a data oficial de conclusão da apuração.</p>
                )}
              </div>
              <div className="space-y-0.5">
                <Label className="text-[11px]">Responsável final *</Label>
                <Input
                  className={cn('mt-0.5 h-8 text-xs', errosVisuais.responsavelFinal && 'border-destructive/60 focus-visible:ring-destructive/30')}
                  aria-invalid={errosVisuais.responsavelFinal ? 'true' : undefined}
                  placeholder="Nome / papel"
                  value={responsavelFinal}
                  onChange={(e) => {
                    setResponsavelFinal(e.target.value)
                    if (errosVisuais.responsavelFinal) setErrosVisuais((prev) => ({ ...prev, responsavelFinal: undefined }))
                  }}
                />
                {errosVisuais.responsavelFinal ? (
                  <p className="text-destructive text-[10px]">{errosVisuais.responsavelFinal}</p>
                ) : (
                  <p className="text-muted-foreground text-[10px]">Pessoa responsável por formalizar o encerramento.</p>
                )}
              </div>
            </div>
            <div className="space-y-0.5">
              <Label className="text-[11px]">Justificativa do encerramento *</Label>
              <Textarea
                className={cn('min-h-[56px] text-xs', errosVisuais.closureJustification && 'border-destructive/60 focus-visible:ring-destructive/30')}
                aria-invalid={errosVisuais.closureJustification ? 'true' : undefined}
                placeholder="Resumo final objetivo da decisão de encerramento"
                value={closureJustification}
                onChange={(e) => {
                  setClosureJustification(e.target.value)
                  if (errosVisuais.closureJustification) setErrosVisuais((prev) => ({ ...prev, closureJustification: undefined }))
                }}
              />
              {errosVisuais.closureJustification ? (
                <p className="text-destructive text-[10px]">{errosVisuais.closureJustification}</p>
              ) : (
                <p className="text-muted-foreground text-[10px]">Registre a motivação final de forma breve e auditável.</p>
              )}
            </div>
          </div>
        ) : null}
        <div className="flex justify-end">
          <Button
            type="button"
            className="h-9 w-full gap-1.5 text-xs sm:w-auto"
            onClick={() => {
              validarVisualCampos()
              void marcarEncerrado()
            }}
            disabled={saving || !investigation?.id}
          >
            <FileText className="size-3.5 shrink-0" aria-hidden />
            {saving ? 'A guardar...' : 'Encerrar e gerar relatório final'}
          </Button>
        </div>
      </InvestigacaoWorkspaceSecao>
    </>
  )
}

function EncerramentoLateral({ investigation }: Readonly<Pick<InvestigacaoEtapasColumnsProps, 'investigation'>>) {
  const dataConclusao = useMemo(() => {
    if (investigation?.closedAt) {
      const data = new Date(investigation.closedAt)
      if (isValid(data)) return format(data, 'dd/MM/yyyy', { locale: ptBR })
    }
    return '03/05/2026'
  }, [investigation?.closedAt])
  const historicoAcoes = useMemo(
    () => [
      {
        id: 'h1',
        acao: 'Triagem validada e caso formalizado',
        quando: '29/04/2026',
      },
      {
        id: 'h2',
        acao: 'Investigação concluída com evidências anexadas',
        quando: '01/05/2026',
      },
      {
        id: 'h3',
        acao: 'Plano de ações aprovado e comunicado ao responsável',
        quando: '02/05/2026',
      },
      {
        id: 'h4',
        acao: 'Encerramento registrado e notificação final enviada',
        quando: dataConclusao,
      },
    ],
    [dataConclusao],
  )

  return (
    <>
      <InvestigacaoWorkspaceSecao
        variant="formulario"
        density="compact"
        titulo="Encerramento"
        subtitulo="Status final do processo e histórico das ações."
        tituloIcon={<History className="size-[1rem] sm:size-[1.05rem]" strokeWidth={2} aria-hidden />}
      >
        <div className="border-border/60 bg-emerald-500/10 mb-2 rounded-md border px-2 py-1.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Data de conclusão</p>
            <Badge variant="secondary" className="h-5 text-[10px]">
              Concluído
            </Badge>
          </div>
          <p className="text-foreground mt-0.5 text-sm font-semibold tabular-nums">{dataConclusao}</p>
        </div>
        <ul className="space-y-1 text-[11px]">
          {historicoAcoes.map((item, index) => {
            const isLast = index === historicoAcoes.length - 1
            return (
              <li key={item.id} className="relative pl-5">
                {!isLast ? <span className="bg-border/70 absolute top-4 left-[7px] h-[calc(100%+0.25rem)] w-px" aria-hidden /> : null}
                <span className="bg-emerald-500 absolute top-1 left-0 size-3.5 rounded-full" aria-hidden />
                <div className="border-border/50 bg-background rounded-md border px-2 py-1.5">
                  <p className="text-foreground leading-tight">{item.acao}</p>
                  <p className="text-muted-foreground mt-0.5 text-[10px] tabular-nums">{item.quando}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </InvestigacaoWorkspaceSecao>
      <InvestigacaoWorkspaceSecao
        variant="formulario"
        density="compact"
        titulo="Relatório final"
        tituloIcon={<FileText className="size-[1rem] sm:size-[1.05rem]" strokeWidth={2} aria-hidden />}
      >
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 flex-1 gap-1.5 text-xs sm:min-w-[9rem]"
            onClick={() => toast.message('Download do relatório (mock)')}
          >
            <FileDown className="size-3.5 shrink-0" aria-hidden />
            Download
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-8 flex-1 gap-1.5 text-xs sm:min-w-[9rem]"
            onClick={() => toast.message('Enviar/Compartilhar relatório (mock)')}
          >
            <SendHorizontal className="size-3.5 shrink-0" aria-hidden />
            Enviar/Compartilhar
          </Button>
        </div>
      </InvestigacaoWorkspaceSecao>
    </>
  )
}

function RelatorioCentro({
  investigation,
  investigationId,
}: Readonly<{
  investigation?: InvestigationDto | null
  investigationId?: string
}>) {
  const [actions, setActions] = useState<CorrectiveActionDto[]>([])
  const [approvals, setApprovals] = useState<ApprovalDecisionDto[]>([])

  useEffect(() => {
    if (!investigationId) return
    listActions(investigationId).then(setActions).catch(() => {})
    listApprovals(investigationId).then(setApprovals).catch(() => {})
  }, [investigationId])

  return (
    <>
      <InvestigacaoWorkspaceSecao
        variant="formulario"
        titulo="Pré-visualização do relatório"
        subtitulo="Resumo consolidado a partir dos dados persistidos."
        tituloIcon={<FileText className="size-[1.05rem] sm:size-[1.15rem]" strokeWidth={2} aria-hidden />}
      >
        <div className="border-border/50 bg-muted/20 max-h-[min(50vh,360px)] overflow-y-auto rounded-lg border p-3 font-mono text-[11px] leading-relaxed">
          <p className="text-foreground font-semibold">Relatório final (rascunho)</p>
          <p className="text-muted-foreground mt-2">1. Síntese factual: {investigation?.factsSummary || '—'}</p>
          <p className="text-muted-foreground mt-1">2. Fundamentação: {investigation?.legalBasis || '—'}</p>
          <p className="text-muted-foreground mt-1">3. Resultado: {investigation?.outcome || '—'}</p>
          <p className="text-muted-foreground mt-1">
            4. Ações corretivas: {actions.length} | Aprovações: {approvals.length}
          </p>
          <p className="text-muted-foreground mt-1">5. Encerramento: {investigation?.closedAt || 'em aberto'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" className="h-8 gap-1 text-xs" onClick={() => toast.success('PDF gerado com dados atuais')}>
            <FileDown className="size-3.5" aria-hidden />
            Gerar PDF
          </Button>
          <Button type="button" size="sm" variant="secondary" className="h-8 gap-1 text-xs" onClick={() => toast.message('Export Word (em implementação)')}>
            Word
          </Button>
          <Button type="button" size="sm" variant="secondary" className="h-8 gap-1 text-xs" onClick={() => toast.message('JSON estruturado (em implementação)')}>
            <FileJson className="size-3.5" aria-hidden />
            JSON
          </Button>
        </div>
      </InvestigacaoWorkspaceSecao>
      <InvestigacaoWorkspaceSecao variant="formulario" density="compact" titulo="Versionamento" tituloIcon={<History className="size-[1rem] sm:size-[1.05rem]" strokeWidth={2} aria-hidden />}>
        <p className="text-muted-foreground text-[11px]">v0.3 — rascunho editável antes de publicação (mock).</p>
      </InvestigacaoWorkspaceSecao>
    </>
  )
}

function RelatorioLateral() {
  return (
    <InvestigacaoWorkspaceSecao
      variant="formulario"
      density="compact"
      titulo="Template"
      tituloIcon={<FileText className="size-[1rem] sm:size-[1.05rem]" strokeWidth={2} aria-hidden />}
    >
      <Select defaultValue="padrao">
        <SelectTrigger className="h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="padrao">Organização — padrão auditável</SelectItem>
          <SelectItem value="regulatorio">Extensão regulatória</SelectItem>
        </SelectContent>
      </Select>
    </InvestigacaoWorkspaceSecao>
  )
}

function GenericoCentro({
  workspaceStep,
  transitions,
}: Readonly<{
  workspaceStep: WorkflowRuntimeStep | undefined
  transitions: TransitionLite[]
}>) {
  return (
    <>
      <InvestigacaoWorkspaceSecao
        variant="formulario"
        titulo={workspaceStep?.label ?? 'Etapa'}
        subtitulo="Sem painel específico — alinhe o rótulo do nó no workflow a uma fase canónica (ex.: «Triagem», «Investigação»)."
        tituloIcon={<GitBranch className="size-[1.05rem] sm:size-[1.15rem]" strokeWidth={2} aria-hidden />}
      >
        <p className="text-muted-foreground text-xs leading-relaxed">
          Este nó não correspondeu às palavras-chave das fases pré-definidas. Ajuste o nome no editor de Workflows ou peça extensão da heurística em{' '}
          <code className="text-foreground bg-muted/50 rounded px-1 py-0.5 text-[10px]">investigacao-workspace-canonical.ts</code>.
        </p>
        {transitions.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {transitions.map((t) => (
              <Button key={t.edgeId} type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => toast.message(t.label)}>
                {t.label} → {t.targetLabel}
              </Button>
            ))}
          </div>
        ) : null}
      </InvestigacaoWorkspaceSecao>
    </>
  )
}

function GenericoLateral() {
  return (
    <InvestigacaoWorkspaceSecao variant="formulario" density="compact" titulo="Dicas" tituloIcon={<HelpCircle className="size-[1rem] sm:size-[1.05rem]" strokeWidth={2} aria-hidden />}>
      <p className="text-muted-foreground text-[11px] leading-snug">
        Renomeie estados no diagrama para refletir as oito fases do modelo de página.
      </p>
    </InvestigacaoWorkspaceSecao>
  )
}

export type InvestigacaoEtapasColumnsProps = Readonly<{
  phase: CanonicalInvestigacaoPhase
  denuncia: DenunciaMock
  investigation?: InvestigationDto | null
  onInvestigationUpdated?: (inv: InvestigationDto) => void
  workspaceStep: WorkflowRuntimeStep | undefined
  transitions: TransitionLite[]
}>

export function InvestigacaoEtapasCenterColumn({
  phase,
  denuncia,
  investigation,
  onInvestigationUpdated,
  workspaceStep,
  transitions,
}: InvestigacaoEtapasColumnsProps) {
  const investigationId = investigation?.id
  switch (phase) {
    case 'recepcao':
      return null
    case 'triagem':
      return <TriagemCentro denuncia={denuncia} transitions={transitions} />
    case 'investigacao':
      return <InvestigacaoCentro />
    case 'analise_conclusao':
      return <AnaliseCentro investigation={investigation} onInvestigationUpdated={onInvestigationUpdated} />
    case 'plano_acao':
      return <PlanoCentro investigationId={investigationId} />
    case 'aprovacao':
      return <AprovacaoCentro transitions={transitions} investigationId={investigationId} />
    case 'encerramento':
      return <EncerramentoCentro investigation={investigation} onInvestigationUpdated={onInvestigationUpdated} />
    case 'relatorio_final':
      return <RelatorioCentro investigation={investigation} investigationId={investigationId} />
    case 'generico':
      return <GenericoCentro workspaceStep={workspaceStep} transitions={transitions} />
    default:
      return null
  }
}

export function InvestigacaoEtapasRightColumn({
  phase,
  investigation,
}: Readonly<Pick<InvestigacaoEtapasColumnsProps, 'phase' | 'investigation'>>) {
  switch (phase) {
    case 'recepcao':
      return null
    case 'triagem':
      return <TriagemLateral />
    case 'investigacao':
      return <InvestigacaoLateral />
    case 'analise_conclusao':
      return <AnaliseLateral />
    case 'plano_acao':
      return <PlanoLateral />
    case 'aprovacao':
      return <AprovacaoLateral />
    case 'encerramento':
      return <EncerramentoLateral investigation={investigation} />
    case 'relatorio_final':
      return <RelatorioLateral />
    case 'generico':
      return <GenericoLateral />
    default:
      return null
  }
}
