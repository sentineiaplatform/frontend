import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowDownUp,
  Building2,
  BriefcaseBusiness,
  Calendar,
  Check,
  CircleCheck,
  CircleDot,
  CircleSlash,
  ClipboardList,
  Columns3,
  Download,
  Eye,
  FileText,
  Gauge,
  Globe,
  Hash,
  History,
  Inbox,
  Kanban,
  Layers,
  ListChecks,
  Mail,
  MessageSquare,
  Phone,
  PhoneCall,
  Plug,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  TableProperties,
  Tags,
  UserPlus,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  registrosKanbanAgrupar,
  RegistrosKanban,
  RegistrosListaPaginada,
  RegistrosPageHeader,
} from '@/components/registros'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  DENUNCIAS_MOCK,
  hrefInvestigacaoDenuncia,
  type DenunciaMock,
  type DenunciaPrioridade,
  type DenunciaStatus,
} from '@/pages/denuncias/denuncias-mock'
import { toast } from 'sonner'

const LINHAS_OPCOES = [10, 20, 35, 50] as const

const STATUS_LABEL: Record<DenunciaStatus, string> = {
  aberta: 'Aberta',
  em_analise: 'Em análise',
  encerrada: 'Encerrada',
}

type ColunaOpcional = 'registradoEm' | 'categoria' | 'canal' | 'status'

/** Modo de lista: tabela ou quadro Kanban (agrupamento configurável no diálogo). */
type ModoListaDenuncias = 'tabela' | 'kanban'

const ROTULO_COLUNA: Record<ColunaOpcional, string> = {
  registradoEm: 'Registrado em',
  categoria: 'Categoria',
  canal: 'Canal',
  status: 'Status',
}

/** Colunas extras sempre visíveis (simulam tabela larga + scroll horizontal). */
const COLUNAS_EXTRAS_FIXAS = 5

type CampoKanbanDenuncias =
  | 'status'
  | 'prioridade'
  | 'canal'
  | 'categoria'
  | 'departamento'
  | 'tipoEntrada'

const ROTULO_CAMPO_KANBAN: Record<CampoKanbanDenuncias, string> = {
  status: 'Status',
  prioridade: 'Prioridade',
  canal: 'Canal',
  categoria: 'Categoria',
  departamento: 'Departamento',
  tipoEntrada: 'Tipo de entrada',
}

const ORDEM_STATUS_KANBAN: DenunciaStatus[] = ['aberta', 'em_analise', 'encerrada']

function groupByDenunciaCampoKanban(
  d: DenunciaMock,
  campo: CampoKanbanDenuncias,
): string {
  switch (campo) {
    case 'status':
      return d.status
    case 'prioridade':
      return d.prioridade
    case 'canal':
      return d.canal
    case 'categoria':
      return d.categoria
    case 'departamento':
      return d.departamento
    case 'tipoEntrada':
      return d.tipoEntrada
    default:
      return ''
  }
}

function ordemSecoesKanban(campo: CampoKanbanDenuncias): string[] | undefined {
  switch (campo) {
    case 'status':
      return ORDEM_STATUS_KANBAN
    case 'prioridade':
      return ['P1', 'P2', 'P3']
    default:
      return undefined
  }
}

function rotuloSecaoKanban(campo: CampoKanbanDenuncias, chave: string): string {
  if (campo === 'status') {
    const s = chave as DenunciaStatus
    if (s in STATUS_LABEL) return STATUS_LABEL[s]
  }
  return chave
}

function aplicarValorCampoKanban(
  d: DenunciaMock,
  campo: CampoKanbanDenuncias,
  chaveColuna: string,
): DenunciaMock {
  const atualizadoEm = new Date().toISOString().slice(0, 19)
  switch (campo) {
    case 'status':
      return {
        ...d,
        status: chaveColuna as DenunciaStatus,
        atualizadoEm,
      }
    case 'prioridade':
      return {
        ...d,
        prioridade: chaveColuna as DenunciaPrioridade,
        atualizadoEm,
      }
    case 'canal':
      return { ...d, canal: chaveColuna, atualizadoEm }
    case 'categoria':
      return { ...d, categoria: chaveColuna, atualizadoEm }
    case 'departamento':
      return { ...d, departamento: chaveColuna, atualizadoEm }
    case 'tipoEntrada':
      return { ...d, tipoEntrada: chaveColuna, atualizadoEm }
    default:
      return d
  }
}

function prioridadeClass(p: DenunciaPrioridade) {
  switch (p) {
    case 'P1':
      return 'bg-rose-50 text-rose-900 dark:bg-rose-950/80 dark:text-rose-100'
    case 'P2':
      return 'bg-amber-50 text-amber-950 dark:bg-amber-950/70 dark:text-amber-50'
    default:
      return 'bg-muted/90 text-muted-foreground'
  }
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

function statusDaDenunciaClass(status: DenunciaStatus) {
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

function iconeCanal(canal: string): LucideIcon {
  const c = canal.toLowerCase()
  if (c.includes('web')) return Globe
  if (c.includes('telefone')) return Phone
  if (c.includes('presencial')) return Building2
  if (c.includes('e-mail') || c.includes('mail')) return Mail
  return MessageSquare
}

function CabecalhoColuna({
  icone: Icon,
  rotulo,
  alinhar = 'left',
}: Readonly<{
  icone: LucideIcon
  rotulo: string
  alinhar?: 'left' | 'right'
}>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        alinhar === 'right' && 'ml-auto w-full justify-end',
      )}
    >
      <Icon
        className="text-muted-foreground/70 size-3 shrink-0"
        aria-hidden
        strokeWidth={1.75}
      />
      <span className="font-medium">{rotulo}</span>
      <ArrowDownUp className="text-muted-foreground/35 size-2.5 shrink-0 opacity-70" aria-hidden strokeWidth={1.75} />
    </span>
  )
}

function exportarCsv(linhas: DenunciaMock[]) {
  const header = [
    'protocolo',
    'registrado_em',
    'categoria',
    'canal',
    'status',
    'prioridade',
    'departamento',
    'area_demanda',
    'tipo_entrada',
    'atualizado_em',
    'qtd_evidencias',
  ]
  const esc = (s: string) => `"${s.replaceAll('"', '""')}"`
  const body = linhas.map((d) =>
    [
      d.protocolo,
      d.registradoEm,
      d.categoria,
      d.canal,
      STATUS_LABEL[d.status],
      d.prioridade,
      d.departamento,
      d.areaDemanda,
      d.tipoEntrada,
      d.atualizadoEm,
      String(d.evidencias.length),
    ]
      .map(esc)
      .join(','),
  )
  const csv = [header.join(','), ...body].join('\r\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `denuncias-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('CSV gerado.')
}

/** Checkbox “marcar página” no cabeçalho da tabela. */
function estadoCabecalhoSelecaoPagina(
  totalLinhas: number,
  marcadosNaPagina: number,
): boolean | 'indeterminate' {
  if (totalLinhas === 0) return false
  if (marcadosNaPagina === 0) return false
  if (marcadosNaPagina === totalLinhas) return true
  return 'indeterminate'
}

function pinTdCheckbox(sel: boolean) {
  return cn(
    'pin-checkbox sticky left-0 z-[25] border-r border-border/40 backdrop-blur-[1px]',
    'w-11 min-w-[2.75rem] px-2 py-2.5 align-middle',
    sel ? 'bg-muted/48' : 'bg-background',
    'group-hover/table-row:bg-muted/12 dark:bg-background dark:group-hover/table-row:bg-muted/15',
  )
}

function pinTdAcoes(sel: boolean) {
  return cn(
    'pin-actions sticky right-0 z-[35] w-[1%] whitespace-nowrap border-l border-border/40 px-2 py-2 align-middle text-right',
    'backdrop-blur-[1px] shadow-[-14px_0_20px_-12px_rgba(0,0,0,0.06)] dark:shadow-black/35',
    sel ? 'bg-muted/48' : 'bg-background',
    'group-hover/table-row:bg-muted/12 dark:bg-background dark:group-hover/table-row:bg-muted/15',
  )
}

export function DenunciasPage() {
  const [denuncias, setDenuncias] = useState<DenunciaMock[]>(() =>
    DENUNCIAS_MOCK.map((row) => ({ ...row })),
  )
  const [pagina, setPagina] = useState(1)
  const [itensPorPagina, setItensPorPagina] = useState(20)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'todos' | DenunciaStatus>('todos')
  const [filtroCanal, setFiltroCanal] = useState<string>('todos')
  const [colunasVisiveis, setColunasVisiveis] = useState<Record<ColunaOpcional, boolean>>({
    registradoEm: true,
    categoria: true,
    canal: true,
    status: true,
  })
  const [modoLista, setModoLista] = useState<ModoListaDenuncias>('tabela')
  const [campoKanban, setCampoKanban] = useState<CampoKanbanDenuncias>('status')
  const [selecao, setSelecao] = useState<Set<string>>(() => new Set())

  const canaisUnicos = useMemo(() => {
    const s = new Set(denuncias.map((d) => d.canal))
    return [...s].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [denuncias])

  const dadosFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return denuncias.filter((d) => {
      const matchBusca =
        q.length === 0 ||
        d.protocolo.toLowerCase().includes(q) ||
        d.categoria.toLowerCase().includes(q) ||
        d.canal.toLowerCase().includes(q) ||
        d.departamento.toLowerCase().includes(q) ||
        d.areaDemanda.toLowerCase().includes(q) ||
        d.tipoEntrada.toLowerCase().includes(q)
      const matchStatus = filtroStatus === 'todos' || d.status === filtroStatus
      const matchCanal = filtroCanal === 'todos' || d.canal === filtroCanal
      return matchBusca && matchStatus && matchCanal
    })
  }, [denuncias, busca, filtroStatus, filtroCanal])

  useEffect(() => {
    setPagina(1)
  }, [busca, filtroStatus, filtroCanal])

  useEffect(() => {
    const permitidos = new Set(dadosFiltrados.map((d) => d.id))
    setSelecao((prev) => new Set([...prev].filter((id) => permitidos.has(id))))
  }, [dadosFiltrados])

  useEffect(() => {
    if (modoLista === 'kanban') setSelecao(new Set())
  }, [modoLista])

  const totalItens = dadosFiltrados.length
  const totalPaginas =
    totalItens <= 0 ? 1 : Math.max(1, Math.ceil(totalItens / itensPorPagina))
  const paginaSegura = Math.min(Math.max(1, pagina), totalPaginas)

  const linhas = useMemo(() => {
    const i = (paginaSegura - 1) * itensPorPagina
    return dadosFiltrados.slice(i, i + itensPorPagina)
  }, [dadosFiltrados, paginaSegura, itensPorPagina])

  const idsPagina = useMemo(() => linhas.map((d) => d.id), [linhas])
  const marcadosPagina = useMemo(() => idsPagina.filter((id) => selecao.has(id)), [idsPagina, selecao])
  const marcacaoPaginaCabecalho = estadoCabecalhoSelecaoPagina(
    linhas.length,
    marcadosPagina.length,
  )

  const aoMudarLinhas = (n: number) => {
    setItensPorPagina(n)
    setPagina(1)
  }

  const filtrosAtivos =
    busca.trim().length > 0 || filtroStatus !== 'todos' || filtroCanal !== 'todos'

  const secoesKanban = useMemo(
    () =>
      registrosKanbanAgrupar(
        dadosFiltrados,
        (d) => groupByDenunciaCampoKanban(d, campoKanban),
        ordemSecoesKanban(campoKanban),
      ),
    [dadosFiltrados, campoKanban],
  )

  const ordemColunasKanban = useMemo(
    () => secoesKanban.map((s) => s.chave),
    [secoesKanban],
  )

  const colunasKanban = useMemo(() => {
    const o: Record<string, DenunciaMock[]> = {}
    for (const s of secoesKanban) {
      o[s.chave] = s.itens
    }
    return o
  }, [secoesKanban])

  const aoColunasKanbanChange = (next: Record<string, DenunciaMock[]>) => {
    const idsFiltrados = new Set(dadosFiltrados.map((x) => x.id))
    setDenuncias((prev) => {
      const flat: DenunciaMock[] = []
      for (const chave of ordemColunasKanban) {
        for (const item of next[chave] ?? []) {
          flat.push(aplicarValorCampoKanban(item, campoKanban, chave))
        }
      }
      const updated = new Map(flat.map((d) => [d.id, d]))
      return prev.map((d) => {
        if (!idsFiltrados.has(d.id)) return d
        const u = updated.get(d.id)
        return u ?? d
      })
    })
  }

  const limparFiltros = () => {
    setBusca('')
    setFiltroStatus('todos')
    setFiltroCanal('todos')
  }

  const alternarColuna = (id: ColunaOpcional, visivel: boolean) => {
    setColunasVisiveis((prev) => {
      const next = { ...prev, [id]: visivel }
      const qtdVisiveis = (Object.keys(next) as ColunaOpcional[]).filter((k) => next[k]).length
      if (qtdVisiveis < 1) {
        toast.message('Mantenha ao menos uma coluna de dados visível.')
        return prev
      }
      return next
    })
  }

  const marcarTodosPagina = (marcado: boolean) => {
    setSelecao((prev) => {
      const next = new Set(prev)
      for (const id of idsPagina) {
        if (marcado) next.add(id)
        else next.delete(id)
      }
      return next
    })
  }

  const alternarLinha = (id: string, marcado: boolean) => {
    setSelecao((prev) => {
      const next = new Set(prev)
      if (marcado) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const limparSelecao = () => setSelecao(new Set())

  const registrosSelecionados = useMemo(
    () => denuncias.filter((d) => selecao.has(d.id)),
    [denuncias, selecao],
  )

  const algumAtivoNaSelecao = useMemo(
    () => registrosSelecionados.some((d) => d.ativa),
    [registrosSelecionados],
  )
  const qtdSelecionados = selecao.size
  const temSelecao = qtdSelecionados > 0

  const navigate = useNavigate()

  const colSpanVazio =
    1 +
    1 +
    [
      colunasVisiveis.registradoEm,
      colunasVisiveis.categoria,
      colunasVisiveis.canal,
      colunasVisiveis.status,
    ].filter(Boolean).length +
    COLUNAS_EXTRAS_FIXAS +
    1

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <RegistrosPageHeader
        title={
          <span className="inline-flex items-center gap-2.5">
            <span className="bg-primary/8 text-primary inline-flex size-9 shrink-0 items-center justify-center rounded-lg">
              <ShieldAlert className="size-[1.15rem]" strokeWidth={1.75} aria-hidden />
            </span>
            <span>Denúncias</span>
          </span>
        }
        description="Lista institucional com seleção para ações em lote."
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground size-9"
              onClick={() => toast.message('Lista atualizada (mock).')}
              aria-label="Atualizar lista"
            >
              <RefreshCw className="size-4" strokeWidth={1.75} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Atualizar</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground size-9"
              onClick={() => exportarCsv(dadosFiltrados)}
              aria-label="Exportar listagem filtrada"
            >
              <Download className="size-4" strokeWidth={1.75} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Exportar</TooltipContent>
        </Tooltip>
        <Button
          type="button"
          variant="default"
          size="sm"
          className="h-9 gap-1.5 rounded-lg px-3"
          onClick={() => navigate('/app/denuncias/new')}
        >
          <Plus className="size-3.5" strokeWidth={2} aria-hidden />
          Nova
        </Button>
      </RegistrosPageHeader>

      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-center sm:justify-between sm:gap-2 sm:overflow-x-auto md:gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-nowrap md:min-h-10 md:flex-1 md:min-w-0">
          <div className="relative w-full max-w-[17.5rem] min-w-0 shrink sm:max-w-[15rem] md:max-w-[17.5rem]">
            <Search
              className="text-muted-foreground/70 pointer-events-none absolute top-1/2 left-2.5 size-[0.95rem] -translate-y-1/2"
              aria-hidden
              strokeWidth={1.75}
            />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar…"
              className="border-border/40 bg-muted/[0.92] dark:bg-muted/95 h-8 w-full border pl-8 text-[13px] shadow-none"
              aria-label="Buscar"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-border/40 bg-transparent h-8 gap-1.5 text-xs shadow-none"
                aria-label="Modo de visualização da lista"
              >
                {modoLista === 'tabela' ? (
                  <TableProperties className="size-3 shrink-0" aria-hidden strokeWidth={1.75} />
                ) : (
                  <Kanban className="size-3 shrink-0" aria-hidden strokeWidth={1.75} />
                )}
                Visualização
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 p-1">
              <DropdownMenuLabel className="text-muted-foreground px-1.5 text-[11px] font-normal uppercase">
                Modo da lista
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2"
                onSelect={() => setModoLista('tabela')}
              >
                <TableProperties className="size-3.5 shrink-0" aria-hidden strokeWidth={1.75} />
                <span className="flex-1">Tabela</span>
                {modoLista === 'tabela' ? (
                  <Check className="text-primary size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
                ) : (
                  <span className="size-3.5 shrink-0" aria-hidden />
                )}
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 [&>svg:last-child]:ml-0">
                  <Kanban className="size-3.5 shrink-0" aria-hidden strokeWidth={1.75} />
                  <span className="flex flex-1 items-center gap-2">
                    <span className="flex-1">Quadro Kanban</span>
                    {modoLista === 'kanban' ? (
                      <Check className="text-primary size-3 shrink-0" strokeWidth={2.5} aria-hidden />
                    ) : null}
                  </span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent sideOffset={6} alignOffset={0} className="min-w-[12.5rem] p-1">
                  <DropdownMenuLabel className="text-muted-foreground px-1.5 text-[10px] font-normal uppercase">
                    Agrupar por
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(Object.keys(ROTULO_CAMPO_KANBAN) as CampoKanbanDenuncias[]).map((id) => (
                    <DropdownMenuItem
                      key={id}
                      className="gap-2 pl-2"
                      onSelect={() => {
                        setCampoKanban(id)
                        setModoLista('kanban')
                      }}
                    >
                      <span className="flex-1">{ROTULO_CAMPO_KANBAN[id]}</span>
                      {modoLista === 'kanban' && campoKanban === id ? (
                        <Check className="text-primary size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
                      ) : null}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>

          {modoLista === 'tabela' ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-border/40 bg-transparent h-8 gap-1 text-xs shadow-none"
                >
                  <Columns3 className="size-3" aria-hidden />
                  Colunas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel className="text-muted-foreground text-[11px] font-normal uppercase">
                  Exibir
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(Object.keys(ROTULO_COLUNA) as ColunaOpcional[]).map((id) => (
                  <DropdownMenuCheckboxItem
                    key={id}
                    checked={colunasVisiveis[id]}
                    onCheckedChange={(checked) => alternarColuna(id, checked === true)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {ROTULO_COLUNA[id]}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>

        <div className="flex w-full shrink-0 flex-nowrap items-center justify-end gap-2 sm:w-auto sm:justify-end sm:gap-2 md:gap-3">
          <Select
            value={filtroStatus}
            onValueChange={(v) =>
              setFiltroStatus(v === 'todos' ? 'todos' : (v as DenunciaStatus))
            }
          >
            <SelectTrigger
              size="sm"
              aria-label="Status"
              className="border-border/40 bg-muted/[0.92] dark:bg-muted/95 h-8 w-[min(100%,10.5rem)] gap-1.5 shadow-none"
            >
              <SlidersHorizontal className="text-muted-foreground size-3 shrink-0" aria-hidden />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {(Object.keys(STATUS_LABEL) as DenunciaStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtroCanal} onValueChange={setFiltroCanal}>
            <SelectTrigger
              size="sm"
              aria-label="Canal"
              className="border-border/40 bg-muted/[0.92] dark:bg-muted/95 h-8 w-[min(100%,11.5rem)] gap-1.5 shadow-none"
            >
              <Layers className="text-muted-foreground size-3 shrink-0" aria-hidden />
              <SelectValue placeholder="Canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os canais</SelectItem>
              {canaisUnicos.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {filtrosAtivos ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground h-8 gap-1 px-2 text-xs"
              onClick={limparFiltros}
            >
              <X className="size-3" strokeWidth={2} aria-hidden />
              Limpar
            </Button>
          ) : null}

          {filtrosAtivos ? (
            <p className="text-muted-foreground shrink-0 text-right text-[11px] sm:text-xs">
              {totalItens} {totalItens === 1 ? 'resultado' : 'resultados'}
            </p>
          ) : null}
        </div>
      </div>

      {temSelecao && modoLista === 'tabela' ? (
        <div
          className="border-primary/20 bg-muted/30 flex flex-col gap-2 rounded-lg border border-l-2 border-l-primary/50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
          role="status"
          aria-live="polite"
        >
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <ListChecks className="text-primary size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="text-foreground font-medium tabular-nums">{qtdSelecionados}</span>
            <span>
              {qtdSelecionados === 1 ? 'selecionado' : 'selecionados'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1 sm:justify-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="size-8"
                  aria-label="Exportar selecionados"
                  onClick={() => exportarCsv(registrosSelecionados)}
                >
                  <Download className="size-3.5" strokeWidth={1.75} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Exportar seleção</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="size-8"
                  aria-label="Atribuir analista"
                  onClick={() => toast.message(`Atribuir ${qtdSelecionados} caso(s).`)}
                >
                  <UserPlus className="size-3.5" strokeWidth={1.75} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Atribuir</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="size-8"
                  aria-label="Etiquetas"
                  onClick={() => toast.message('Etiquetas (mock).')}
                >
                  <Tags className="size-3.5" strokeWidth={1.75} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Etiquetas</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className={
                    algumAtivoNaSelecao
                      ? 'border-destructive/25 text-destructive hover:bg-destructive/10 size-8'
                      : 'size-8'
                  }
                  aria-label={
                    algumAtivoNaSelecao ? 'Inativar selecionados' : 'Ativar selecionados'
                  }
                  onClick={() => {
                    const proxima = !algumAtivoNaSelecao
                    setDenuncias((prev) =>
                      prev.map((row) =>
                        selecao.has(row.id) ? { ...row, ativa: proxima } : row,
                      ),
                    )
                    toast.message(
                      proxima
                        ? `${qtdSelecionados} caso(s) ativado(s) (simulado).`
                        : `${qtdSelecionados} caso(s) inativado(s) (simulado).`,
                    )
                  }}
                >
                  {algumAtivoNaSelecao ? (
                    <CircleSlash className="size-3.5" strokeWidth={1.75} />
                  ) : (
                    <CircleCheck className="size-3.5" strokeWidth={1.75} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {algumAtivoNaSelecao ? 'Inativar' : 'Ativar'}
              </TooltipContent>
            </Tooltip>
            <div className="bg-border/60 mx-1 hidden h-5 w-px sm:block" aria-hidden />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground size-8"
                  aria-label="Limpar seleção"
                  onClick={limparSelecao}
                >
                  <X className="size-3.5" strokeWidth={1.75} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Limpar seleção</TooltipContent>
            </Tooltip>
          </div>
        </div>
      ) : null}

      {modoLista === 'tabela' ?
        <RegistrosListaPaginada
        className="mt-0"
        areaLabel="Tabela de denúncias"
        paginacao={{
          paginaAtual: paginaSegura,
          itensPorPagina,
          totalItens,
          onPaginaChange: setPagina,
          opcoesItensPorPagina: LINHAS_OPCOES,
          onItensPorPaginaChange: aoMudarLinhas,
        }}
      >
        <Table className="border-collapse min-w-[1280px] text-[13px]">
          <TableHeader className="bg-muted/[0.92] [&_th]:whitespace-normal [&_tr:hover]:bg-transparent">
            <TableRow className="border-border/40 hover:bg-transparent border-b">
              <TableHead
                className={cn(
                  'text-muted-foreground sticky left-0 z-40 w-11 min-w-[2.75rem] px-2 py-2.5',
                  'bg-muted/[0.92] backdrop-blur-[2px] border-r border-border/40',
                )}
              >
                <div className="flex justify-center">
                  <Checkbox
                    aria-label="Selecionar todos nesta página"
                    checked={marcacaoPaginaCabecalho}
                    onCheckedChange={(v) => marcarTodosPagina(v === true)}
                  />
                </div>
              </TableHead>
              <TableHead className="text-muted-foreground min-w-[7.5rem] px-2 py-2.5 text-left text-[11px]">
                <CabecalhoColuna icone={Hash} rotulo="Protocolo" />
              </TableHead>
              {colunasVisiveis.registradoEm ? (
                <TableHead className="text-muted-foreground px-2 py-2.5 text-left text-[11px]">
                  <CabecalhoColuna icone={Calendar} rotulo="Data" />
                </TableHead>
              ) : null}
              {colunasVisiveis.categoria ? (
                <TableHead className="text-muted-foreground px-2 py-2.5 text-left text-[11px]">
                  <CabecalhoColuna icone={Tags} rotulo="Categoria" />
                </TableHead>
              ) : null}
              {colunasVisiveis.canal ? (
                <TableHead className="text-muted-foreground px-2 py-2.5 text-left text-[11px]">
                  <CabecalhoColuna icone={PhoneCall} rotulo="Canal" />
                </TableHead>
              ) : null}
              {colunasVisiveis.status ? (
                <TableHead className="text-muted-foreground min-w-[9rem] px-2 py-2.5 text-right text-[11px]">
                  <CabecalhoColuna icone={CircleDot} rotulo="Status" alinhar="right" />
                </TableHead>
              ) : null}
              <TableHead className="text-muted-foreground min-w-[6.5rem] px-2 py-2.5 text-left text-[11px]">
                <CabecalhoColuna icone={Gauge} rotulo="Prioridade" />
              </TableHead>
              <TableHead className="text-muted-foreground min-w-[13rem] px-2 py-2.5 text-left text-[11px]">
                <CabecalhoColuna icone={BriefcaseBusiness} rotulo="Departamento" />
              </TableHead>
              <TableHead className="text-muted-foreground min-w-[12rem] px-2 py-2.5 text-left text-[11px]">
                <CabecalhoColuna icone={ClipboardList} rotulo="Área demandada" />
              </TableHead>
              <TableHead className="text-muted-foreground min-w-[11rem] px-2 py-2.5 text-left text-[11px]">
                <CabecalhoColuna icone={Plug} rotulo="Entrada" />
              </TableHead>
              <TableHead className="text-muted-foreground min-w-[9.5rem] px-2 py-2.5 text-left text-[11px]">
                <CabecalhoColuna icone={History} rotulo="Atualizado" />
              </TableHead>
              <TableHead
                className={cn(
                  'text-muted-foreground sticky right-0 z-40 w-[1%] whitespace-nowrap px-2 py-2 text-center',
                  'border-l border-border/40 bg-muted/[0.92] shadow-[-14px_0_20px_-12px_rgba(0,0,0,0.09)] backdrop-blur-sm dark:bg-muted/95 dark:shadow-black/35',
                  'text-[11px]',
                )}
              >
                <span className="text-muted-foreground block w-full text-center text-[10px] font-semibold tracking-wide uppercase">
                  Ações
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_td]:whitespace-normal">
            {linhas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={colSpanVazio}
                  className="text-muted-foreground py-14 text-center text-sm"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Inbox className="text-muted-foreground/50 size-8" strokeWidth={1.25} />
                    Nenhum resultado. Ajuste filtros ou busca.
                  </div>
                </TableCell>
              </TableRow>
            ) : linhas.map((d) => {
                const CanalIcon = iconeCanal(d.canal)
                const sel = selecao.has(d.id)
                return (
                  <TableRow
                    key={d.id}
                    data-selected={sel || undefined}
                    className={cn(
                      'group/table-row border-border/30 border-b transition-colors',
                      sel ? 'bg-muted/35' : 'hover:bg-muted/12',
                      !d.ativa && 'opacity-[0.72]',
                    )}
                  >
                    <TableCell className={pinTdCheckbox(sel)}>
                      <div className="flex justify-center">
                        <Checkbox
                          aria-label={`Selecionar ${d.protocolo}`}
                          checked={sel}
                          onCheckedChange={(v) => alternarLinha(d.id, v === true)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-primary min-w-[9rem] px-2 py-2.5 align-middle">
                      <button
                        type="button"
                        className="hover:text-primary/90 inline-flex max-w-full items-start gap-2 text-left text-[13px] leading-snug font-medium underline-offset-2 hover:underline"
                        onClick={() =>
                          navigate(hrefInvestigacaoDenuncia(d.protocolo), {
                            state: { denunciasVista: modoLista },
                          })
                        }
                        aria-label={`Abrir investigação — ${d.protocolo}`}
                      >
                        <FileText className="text-primary/55 mt-0.5 size-4 shrink-0" aria-hidden strokeWidth={1.75} />
                        <span className="break-words">{d.protocolo}</span>
                      </button>
                    </TableCell>
                    {colunasVisiveis.registradoEm ? (
                      <TableCell className="text-muted-foreground px-2 py-2.5 align-middle tabular-nums">
                        {formatoData(d.registradoEm)}
                      </TableCell>
                    ) : null}
                    {colunasVisiveis.categoria ? (
                      <TableCell className="text-foreground min-w-[7rem] max-w-[min(18rem,28vw)] break-words px-2 py-2.5 align-middle leading-snug">
                        {d.categoria}
                      </TableCell>
                    ) : null}
                    {colunasVisiveis.canal ? (
                      <TableCell className="text-muted-foreground min-w-[8.5rem] px-2 py-2.5 align-middle">
                        <span className="inline-flex items-start gap-2">
                          <span className="bg-muted/50 text-muted-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-md">
                            <CanalIcon className="size-[0.95rem]" aria-hidden strokeWidth={1.75} />
                          </span>
                          <span className="min-w-0 max-w-[14rem] break-words leading-snug">{d.canal}</span>
                        </span>
                      </TableCell>
                    ) : null}
                    {colunasVisiveis.status ? (
                      <TableCell className="px-2 py-2.5 text-right align-middle">
                        <span
                          className={cn(
                            'inline-flex h-6 items-center justify-center rounded-full px-2 text-[11px] font-medium',
                            statusDaDenunciaClass(d.status),
                          )}
                        >
                          {STATUS_LABEL[d.status]}
                        </span>
                      </TableCell>
                    ) : null}
                    <TableCell className="px-2 py-2.5 align-middle">
                      <span
                        className={cn(
                          'inline-flex min-w-[2rem] justify-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums',
                          prioridadeClass(d.prioridade),
                        )}
                      >
                        {d.prioridade}
                      </span>
                    </TableCell>
                    <TableCell className="text-foreground max-w-[14rem] px-2 py-2.5 align-middle text-[12px] leading-snug whitespace-normal">
                      {d.departamento}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[14rem] px-2 py-2.5 align-middle text-[12px] leading-snug whitespace-normal">
                      {d.areaDemanda}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[12rem] px-2 py-2.5 align-middle text-[12px]">
                      {d.tipoEntrada}
                    </TableCell>
                    <TableCell className="text-muted-foreground px-2 py-2.5 align-middle tabular-nums">
                      {formatoData(d.atualizadoEm)}
                    </TableCell>
                    <TableCell className={pinTdAcoes(sel)}>
                      <div
                        className="denuncias-acoes-inline inline-flex flex-nowrap items-center justify-end gap-1"
                        data-testid="denuncias-acoes-inline"
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className={cn(
                                'text-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border/90 bg-background',
                                'shadow-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none',
                              )}
                              title="Ver detalhes"
                              aria-label={`Ver detalhes de ${d.protocolo}`}
                              onClick={() => toast.message(`Detalhes: ${d.protocolo} (mock).`)}
                            >
                              <Eye className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Ver detalhes</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className={cn(
                                'text-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border/90 bg-background',
                                'shadow-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none',
                              )}
                              title="Anotar"
                              aria-label={`Anotar ${d.protocolo}`}
                              onClick={() => toast.message(`Anotar: ${d.protocolo} (mock).`)}
                            >
                              <Tags className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Anotar</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className={cn(
                                d.ativa
                                  ? 'inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-destructive/40 bg-background text-destructive shadow-sm transition-colors hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-destructive/30 focus-visible:outline-none'
                                  : 'text-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border/90 bg-background shadow-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none',
                              )}
                              title={d.ativa ? 'Inativar' : 'Ativar'}
                              aria-label={
                                d.ativa
                                  ? `Inativar ${d.protocolo}`
                                  : `Ativar ${d.protocolo}`
                              }
                              onClick={() => {
                                setDenuncias((prev) =>
                                  prev.map((row) =>
                                    row.id === d.id
                                      ? { ...row, ativa: !row.ativa }
                                      : row,
                                  ),
                                )
                                toast.message(
                                  d.ativa
                                    ? `${d.protocolo} inativada (simulado).`
                                    : `${d.protocolo} ativada (simulado).`,
                                )
                              }}
                            >
                              {d.ativa ? (
                                <CircleSlash className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                              ) : (
                                <CircleCheck
                                  className="size-4 shrink-0"
                                  strokeWidth={2}
                                  aria-hidden
                                />
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {d.ativa ? 'Inativar' : 'Ativar'}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            }
          </TableBody>
        </Table>
      </RegistrosListaPaginada>
      :
        <RegistrosKanban
          className="mt-0"
          areaLabel="Quadro Kanban de denúncias"
          ordemColunasChaves={ordemColunasKanban}
          colunas={colunasKanban}
          onColunasChange={aoColunasKanbanChange}
          chaveItem={(d) => d.id}
          rotuloSecao={(chave) => rotuloSecaoKanban(campoKanban, chave)}
          renderCard={(d, { dragging }) => {
            const CanalIcon = iconeCanal(d.canal)
            return (
              <article
                className={cn(
                  'border-border/55 bg-card text-card-foreground group/card relative rounded-lg border',
                  'shadow-sm ring-1 ring-transparent transition-[box-shadow,border-color,background-color]',
                  'hover:border-primary/25 hover:bg-accent/[0.45] hover:shadow-md hover:ring-primary/[0.12]',
                  'dark:hover:bg-accent/[0.35]',
                  'focus-within:border-primary/35 focus-within:ring-primary/20 focus-within:ring-2 focus-within:outline-none',
                  dragging && 'opacity-[0.96]',
                )}
              >
                <div
                  className="pointer-events-none absolute inset-y-[6px] left-0 w-[3px] rounded-r-full bg-primary/45 opacity-85 group-hover/card:bg-primary/65"
                  aria-hidden
                />
                <div className="relative px-3.5 py-2.5 pl-[15px]">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        'bg-muted/60 text-muted-foreground mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md',
                        'ring-1 ring-border/40 transition-colors group-hover/card:bg-muted/80 dark:bg-muted/40 dark:ring-border/30',
                      )}
                    >
                      <CanalIcon className="size-3.5" aria-hidden strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <button
                        type="button"
                        className="text-primary hover:text-primary/85 text-left text-[13px] font-semibold leading-tight tracking-tight underline-offset-2 hover:underline"
                        onClick={() =>
                          navigate(hrefInvestigacaoDenuncia(d.protocolo), {
                            state: { denunciasVista: modoLista },
                          })
                        }
                        aria-label={`Abrir investigação — ${d.protocolo}`}
                      >
                        {d.protocolo}
                      </button>
                      <p className="text-foreground/95 line-clamp-2 text-[12px] leading-snug">{d.categoria}</p>
                      <p className="text-muted-foreground truncate text-[11px] leading-snug">{d.departamento}</p>
                    </div>
                  </div>
                  <div
                    className="border-border/40 mt-2.5 flex flex-wrap items-center gap-1.5 border-t pt-2.5 text-[10px] font-medium"
                  >
                    <span
                      className={cn(
                        'inline-flex h-5 shrink-0 items-center rounded-full px-2',
                        statusDaDenunciaClass(d.status),
                      )}
                    >
                      {STATUS_LABEL[d.status]}
                    </span>
                    <span
                      className={cn(
                        'shrink-0 rounded px-1.5 py-0.5 tabular-nums tracking-tight',
                        prioridadeClass(d.prioridade),
                      )}
                    >
                      {d.prioridade}
                    </span>
                  </div>
                </div>
              </article>
            )
          }}
        />
      }
    </div>
  )
}
