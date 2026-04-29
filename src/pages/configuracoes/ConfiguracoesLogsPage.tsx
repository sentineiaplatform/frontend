import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangleIcon,
  BellIcon,
  Building2Icon,
  ClipboardCopyIcon,
  FileBarChartIcon,
  FlaskConicalIcon,
  HardDriveIcon,
  ListFilterIcon,
  PlugIcon,
  ScrollTextIcon,
  SearchIcon,
  ShieldIcon,
  Trash2Icon,
  UserIcon,
  XIcon,
} from 'lucide-react'
import { toast } from 'sonner'

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
import { FieldLegend } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { RegistrosListaPaginada } from '@/components/registros'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AUTH_INPUT_GROUP_ADDON_CLASS,
  AUTH_INPUT_GROUP_CLASS,
  AUTH_INPUT_GROUP_CONTROL_CLASS,
} from '@/lib/auth-matched-input-group'
import { cn } from '@/lib/utils'

import {
  getMockConfigAuditLogEntries,
  isMockAuditEntry,
} from '@/pages/configuracoes/configuracoes-audit-log-mock'
import {
  clearConfigAuditLog,
  type ConfigAuditLogEntry,
  CONFIG_AUDIT_LOG_STORAGE_KEY,
  readConfigAuditLog,
} from '@/pages/configuracoes/configuracoes-audit-log'
import {
  configuracoesPageShellClass,
  configuracoesSectionCardClass,
  configuracoesSectionIconClass,
} from '@/pages/configuracoes/configuracoes-layout'

const LINHAS_LOGS_OPCOES = [10, 20, 35, 50] as const

const categoriaLabel: Record<ConfigAuditLogEntry['category'], string> = {
  geral: 'Geral',
  perfil: 'Perfil',
  seguranca: 'Segurança',
  integracao: 'Integração',
  notificacoes: 'Notificações',
  relatorios: 'Relatórios',
}

const categoryIcon: Record<
  ConfigAuditLogEntry['category'],
  typeof Building2Icon
> = {
  geral: Building2Icon,
  perfil: UserIcon,
  seguranca: ShieldIcon,
  integracao: PlugIcon,
  notificacoes: BellIcon,
  relatorios: FileBarChartIcon,
}

function formatWhen(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatRelativeShort(iso: string): string {
  const d = new Date(iso).getTime()
  if (Number.isNaN(d)) return '—'
  const diffMs = Date.now() - d
  const m = Math.floor(diffMs / 60000)
  if (m < 1) return 'agora'
  if (m < 60) return `há ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `há ${h} h`
  const days = Math.floor(h / 24)
  if (days < 30) return `há ${days} ${days === 1 ? 'dia' : 'dias'}`
  const months = Math.floor(days / 30)
  return `há ~${months} ${months === 1 ? 'mês' : 'meses'}`
}

type LogRowProps = {
  row: ConfigAuditLogEntry
}

function LogEventMobileCard({ row }: LogRowProps) {
  const mock = isMockAuditEntry(row.id)
  const CatIcon = categoryIcon[row.category]

  const origin = (
    <div className="flex flex-wrap items-center gap-1.5">
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium',
          mock
            ? 'border-amber-500/35 bg-amber-500/10 text-amber-900 dark:text-amber-100'
            : 'bg-primary/8 text-primary border-primary/15',
        )}
      >
        <CatIcon className="size-3.5 shrink-0 opacity-90" aria-hidden />
        {categoriaLabel[row.category]}
      </span>
      {mock ? (
        <span className="text-amber-800 dark:text-amber-200/90 bg-amber-500/15 border-amber-500/25 rounded border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
          Exemplo
        </span>
      ) : null}
    </div>
  )

  const when = (
    <div>
      <time
        className="text-foreground font-medium"
        dateTime={row.at}
        title={formatWhen(row.at)}
      >
        {formatRelativeShort(row.at)}
      </time>
      <span className="text-muted-foreground mt-0.5 block text-[11px] tabular-nums leading-tight sm:text-xs">
        {formatWhen(row.at)}
      </span>
    </div>
  )

  return (
    <article
      className={cn(
        'border-border/60 bg-background rounded-xl border p-4 shadow-sm',
        mock && 'border-l-amber-500/60 border-l-[3px] bg-amber-500/[0.04]',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        {when}
        {origin}
      </div>
      <h3 className="text-foreground mt-3 text-sm font-semibold leading-snug">{row.action}</h3>
      {row.detail ? (
        <p className="text-muted-foreground mt-2 text-xs leading-relaxed">{row.detail}</p>
      ) : (
        <p className="text-muted-foreground/70 mt-2 text-xs italic">Sem detalhe adicional</p>
      )}
    </article>
  )
}

/** Histórico local de alterações em Configurações (até existir API de auditoria). */
export function ConfiguracoesLogsPage() {
  const [listVersion, setListVersion] = useState(0)
  const storedEntries = useMemo(() => readConfigAuditLog(), [listVersion])
  const mockEntries = useMemo(() => getMockConfigAuditLogEntries(), [])
  const [query, setQuery] = useState('')
  const [pagina, setPagina] = useState(1)
  const [itensPorPagina, setItensPorPagina] = useState(20)

  const allEntries = useMemo(() => {
    const merged = [...storedEntries, ...mockEntries]
    return merged.sort((a, b) => b.at.localeCompare(a.at))
  }, [storedEntries, mockEntries])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allEntries
    return allEntries.filter((e) => {
      const mockTag = isMockAuditEntry(e.id) ? 'exemplo demonstração' : ''
      const hay = `${e.action} ${e.detail ?? ''} ${categoriaLabel[e.category]} ${mockTag}`.toLowerCase()
      return hay.includes(q)
    })
  }, [allEntries, query])

  const filtersActive = query.trim() !== ''

  const totalItens = filtered.length
  const totalPaginas = totalItens <= 0 ? 1 : Math.max(1, Math.ceil(totalItens / itensPorPagina))
  const paginaSegura = Math.min(Math.max(1, pagina), totalPaginas)

  const paginatedRows = useMemo(() => {
    const i = (paginaSegura - 1) * itensPorPagina
    return filtered.slice(i, i + itensPorPagina)
  }, [filtered, paginaSegura, itensPorPagina])

  useEffect(() => {
    setPagina(1)
  }, [query])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape' || !query.trim()) return
      e.preventDefault()
      setQuery('')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [query])


  async function onCopyJson() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(storedEntries, null, 2))
      toast.success('Copiado', {
        description: 'Apenas eventos salvos neste dispositivo (sem exemplos).',
      })
    } catch {
      toast.error('Não foi possível copiar')
    }
  }

  function onClearConfirmed() {
    if (!clearConfigAuditLog()) {
      toast.error('Não foi possível limpar', {
        description: 'Armazenamento local indisponível.',
      })
      return
    }
    setListVersion((v) => v + 1)
    setQuery('')
    toast.message('Histórico limpo neste dispositivo.')
  }

  return (
    <TooltipProvider delayDuration={400}>
      <div className={configuracoesPageShellClass}>
        <header className="border-border/50 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:gap-4">
          <div className="bg-muted/30 text-muted-foreground border-border/60 flex size-11 shrink-0 items-center justify-center rounded-xl border sm:size-12">
            <ScrollTextIcon className="size-5 sm:size-[1.35rem]" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 gap-y-1">
              <h1 className="text-foreground font-heading text-xl font-semibold tracking-tight sm:text-2xl">
                Logs
              </h1>
              <span className="text-muted-foreground bg-muted/50 border-border/50 inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase sm:text-[11px]">
                Armazenamento local
              </span>
            </div>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
              Linha do tempo das alterações salvas em Configurações neste navegador, com linhas de
              exemplo para referência visual. Em produção, a organização poderá integrar auditoria
              pela API.
            </p>
          </div>
        </header>

        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {filtered.length === 0
            ? 'Nenhum evento corresponde à busca.'
            : `${filtered.length} evento${filtered.length !== 1 ? 's' : ''} na lista.`}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="border-border/60 bg-background group relative flex min-h-[4.75rem] flex-col justify-center overflow-hidden rounded-xl border px-4 py-3 transition-shadow hover:shadow-sm sm:py-4">
            <div className="text-primary/25 pointer-events-none absolute -right-2 -bottom-3">
              <HardDriveIcon className="size-16 stroke-[1]" aria-hidden />
            </div>
            <p className="text-muted-foreground relative text-[11px] font-medium tracking-wide uppercase">
              Neste dispositivo
            </p>
            <p className="text-foreground relative font-heading text-2xl font-semibold tabular-nums">
              {storedEntries.length}
            </p>
          </div>
          <div className="border-border/60 bg-background group relative flex min-h-[4.75rem] flex-col justify-center overflow-hidden rounded-xl border px-4 py-3 transition-shadow hover:shadow-sm sm:py-4">
            <div className="text-amber-500/20 pointer-events-none absolute -right-2 -bottom-3">
              <FlaskConicalIcon className="size-16 stroke-[1]" aria-hidden />
            </div>
            <p className="text-muted-foreground relative text-[11px] font-medium tracking-wide uppercase">
              Exemplos ativos
            </p>
            <p className="text-foreground relative font-heading text-2xl font-semibold tabular-nums">
              {mockEntries.length}
            </p>
          </div>
          <div className="border-border/60 bg-background group relative flex min-h-[4.75rem] flex-col justify-center overflow-hidden rounded-xl border px-4 py-3 transition-shadow hover:shadow-sm sm:py-4">
            <div className="text-muted-foreground/25 pointer-events-none absolute -right-2 -bottom-3">
              <ListFilterIcon className="size-16 stroke-[1]" aria-hidden />
            </div>
            <p className="text-muted-foreground relative text-[11px] font-medium tracking-wide uppercase">
              Com filtros
            </p>
            <p className="text-foreground relative font-heading text-2xl font-semibold tabular-nums">
              {filtered.length}
              {filtersActive ? (
                <span className="text-muted-foreground ml-1 text-sm font-normal">
                  de {allEntries.length}
                </span>
              ) : null}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className={cn(configuracoesSectionCardClass, 'min-h-0')}>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="flex min-w-0 gap-3">
                <div className={configuracoesSectionIconClass}>
                  <ScrollTextIcon className="size-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <FieldLegend className="text-foreground font-heading !mb-0 px-0 text-base font-semibold tracking-tight">
                    Registro de eventos
                  </FieldLegend>
                  <p className="text-muted-foreground mt-1 text-xs leading-snug">
                    Chave no navegador:{' '}
                    <code className="text-foreground/80 text-[11px] break-all">
                      {CONFIG_AUDIT_LOG_STORAGE_KEY}
                    </code>
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5"
                        onClick={() => onCopyJson()}
                        disabled={storedEntries.length === 0}
                      >
                        <ClipboardCopyIcon className="size-3.5 opacity-90" aria-hidden />
                        Copiar JSON
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={6}>
                    Exporta só eventos reais (sem linhas de exemplo).
                  </TooltipContent>
                </Tooltip>
                <AlertDialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex">
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive/30 hover:bg-destructive/10 h-9 gap-1.5"
                            disabled={storedEntries.length === 0}
                          >
                            <Trash2Icon className="size-3.5 opacity-90" aria-hidden />
                            Limpar
                          </Button>
                        </AlertDialogTrigger>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={6}>
                      Apaga o histórico salvo localmente. Exemplos não são removidos.
                    </TooltipContent>
                  </Tooltip>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Limpar histórico local?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação remove apenas os eventos reais guardados neste dispositivo. As linhas
                        de exemplo na lista não são removidas. Não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={onClearConfirmed}
                      >
                        Limpar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="border-border/50 bg-muted/15 mb-5 rounded-xl border px-4 py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Label htmlFor="logs-search" className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                    Busca
                  </Label>
                  <InputGroup className={cn(AUTH_INPUT_GROUP_CLASS)}>
                    <InputGroupAddon align="inline-start" className={AUTH_INPUT_GROUP_ADDON_CLASS}>
                      <SearchIcon className="size-4 shrink-0 opacity-80" aria-hidden />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="logs-search"
                      className={AUTH_INPUT_GROUP_CONTROL_CLASS}
                      placeholder="Ação, detalhe, origem ou “exemplo”…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      aria-label="Buscar nos eventos"
                      autoComplete="off"
                    />
                    {query.trim() ? (
                      <InputGroupAddon align="inline-end" className="pr-1">
                        <InputGroupButton
                          type="button"
                          size="icon-xs"
                          variant="ghost"
                          aria-label="Limpar busca"
                          onClick={() => setQuery('')}
                        >
                          <XIcon className="size-3.5" aria-hidden />
                        </InputGroupButton>
                      </InputGroupAddon>
                    ) : null}
                  </InputGroup>
                  <p className="text-muted-foreground text-[11px] leading-snug">
                    Dica: tecla <kbd className="bg-muted rounded border px-1 py-0.5 font-mono text-[10px]">Esc</kbd>{' '}
                    limpa a busca.
                  </p>
                </div>
                {filtersActive ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground h-9 shrink-0 gap-1.5 self-start sm:self-auto"
                    onClick={() => setQuery('')}
                  >
                    Limpar busca
                  </Button>
                ) : null}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="border-border/50 text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-12 text-center text-sm">
                <AlertTriangleIcon className="size-10 text-amber-500/85" aria-hidden />
                <p className="text-foreground max-w-sm font-medium">Nada corresponde à busca</p>
                <p className="max-w-md text-xs leading-relaxed">
                  Tente outros termos ou limpe o campo para ver todos os eventos.
                </p>
                {filtersActive ? (
                  <Button type="button" variant="outline" size="sm" className="mt-1" onClick={() => setQuery('')}>
                    Limpar busca
                  </Button>
                ) : null}
              </div>
            ) : (
              <RegistrosListaPaginada
                className="mt-0"
                areaLabel="Lista de logs de auditoria"
                paginacao={{
                  paginaAtual: paginaSegura,
                  itensPorPagina,
                  totalItens,
                  onPaginaChange: setPagina,
                  opcoesItensPorPagina: LINHAS_LOGS_OPCOES,
                  onItensPorPaginaChange: (n) => {
                    setItensPorPagina(n)
                    setPagina(1)
                  },
                }}
              >
                <>
                  <div className="lg:hidden space-y-3 p-3">
                    {paginatedRows.map((row) => (
                      <LogEventMobileCard key={row.id} row={row} />
                    ))}
                  </div>
                  <div className="max-lg:hidden">
                    <Table className="border-collapse min-w-[46rem] text-[13px]">
                      <TableHeader className="bg-muted/[0.92] [&_tr:hover]:bg-transparent">
                        <TableRow className="border-border/40 hover:bg-transparent border-b">
                          <TableHead
                            scope="col"
                            className="text-muted-foreground px-3 py-2.5 text-left text-[11px] sm:px-4"
                          >
                            Quando
                          </TableHead>
                          <TableHead
                            scope="col"
                            className="text-muted-foreground px-3 py-2.5 text-left text-[11px] sm:px-4"
                          >
                            Origem
                          </TableHead>
                          <TableHead
                            scope="col"
                            className="text-muted-foreground px-3 py-2.5 text-left text-[11px] sm:px-4"
                          >
                            Ação
                          </TableHead>
                          <TableHead
                            scope="col"
                            className="text-muted-foreground max-w-md px-3 py-2.5 text-left text-[11px] sm:px-4"
                          >
                            Detalhe
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedRows.map((row) => {
                          const mock = isMockAuditEntry(row.id)
                          const CatIcon = categoryIcon[row.category]
                          return (
                            <TableRow
                              key={row.id}
                              className={cn(
                                'border-border/50',
                                mock && 'border-l-amber-500/55 bg-amber-500/[0.06] border-l-2',
                              )}
                            >
                              <TableCell className="px-3 py-2.5 align-top whitespace-normal sm:px-4">
                                <time
                                  className="text-foreground font-medium"
                                  dateTime={row.at}
                                  title={formatWhen(row.at)}
                                >
                                  {formatRelativeShort(row.at)}
                                </time>
                                <span className="text-muted-foreground mt-0.5 block text-[11px] tabular-nums leading-tight sm:text-xs">
                                  {formatWhen(row.at)}
                                </span>
                              </TableCell>
                              <TableCell className="px-3 py-2.5 align-top whitespace-normal sm:px-4">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span
                                    className={cn(
                                      'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium',
                                      mock
                                        ? 'border-amber-500/35 bg-amber-500/10 text-amber-900 dark:text-amber-100'
                                        : 'bg-primary/8 text-primary border-primary/15',
                                    )}
                                  >
                                    <CatIcon className="size-3.5 shrink-0 opacity-90" aria-hidden />
                                    {categoriaLabel[row.category]}
                                  </span>
                                  {mock ? (
                                    <span className="text-amber-800 dark:text-amber-200/90 bg-amber-500/15 border-amber-500/25 rounded border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                                      Exemplo
                                    </span>
                                  ) : null}
                                </div>
                              </TableCell>
                              <TableCell className="text-foreground max-w-[15rem] px-3 py-2.5 align-top whitespace-normal sm:max-w-none sm:px-4">
                                <span className="line-clamp-2 sm:line-clamp-none">{row.action}</span>
                              </TableCell>
                              <TableCell className="text-muted-foreground max-w-md px-3 py-2.5 align-top whitespace-normal sm:px-4">
                                <span className="line-clamp-3 leading-snug">{row.detail ?? '—'}</span>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </>
              </RegistrosListaPaginada>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
