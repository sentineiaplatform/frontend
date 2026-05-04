import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CircleCheck,
  CircleSlash,
  Download,
  Eye,
  History,
  ListChecks,
  ListOrdered,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Tags,
  TextAlignStart,
  ToggleLeft,
  X,
} from 'lucide-react'

import { useConfirmDialog } from '@/components/dialogs/confirm-dialog-context'
import { RegistrosListaPaginada, RegistrosPageHeader } from '@/components/registros'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { plainTextFromHtml } from '@/lib/html-plain-text'
import { cn } from '@/lib/utils'
import {
  CabecalhoColuna,
  CabecalhoColunaAcoes,
  CelulaTextoRico,
  CelulaValorBooleano,
  estadoCabecalhoSelecaoPagina,
  formatoDataHora,
  LINHAS_DADOS_MESTRES,
  pinTdAcoes,
  pinTdCheckbox,
} from '@/pages/dados-mestres/dados-mestres-listagem-shared'
import type { CategoriaDenunciaMock } from '@/pages/dados-mestres/dados-mestres-mock'
import {
  fetchComplaintCategories,
  updateComplaintCategory,
} from '@/services/complaint-category-service'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

function textoPlanoPreview(html: string, max = 160): string {
  const t = plainTextFromHtml(html)
  return t.length <= max ? t : `${t.slice(0, max)}…`
}

function exportarCsvCategorias(linhas: CategoriaDenunciaMock[]) {
  const header = ['nome', 'descricao', 'sla_dias', 'ativo', 'atualizado_em']
  const esc = (s: string) => `"${s.replaceAll('"', '""')}"`
  const body = linhas.map((r) =>
    [
      r.nome,
      plainTextFromHtml(r.descricao),
      String(r.slaDias),
      r.ativo ? 'sim' : 'nao',
      r.atualizadoEm,
    ]
      .map(esc)
      .join(','),
  )
  const csv = [header.join(','), ...body].join('\r\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `categorias-denuncias-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('CSV gerado.')
}

/** Dados mestres — categorias de denúncia (listagem no padrão da tela de Denúncias). */
export function CategoriaDenunciasPage() {
  const { confirm } = useConfirmDialog()
  const navigate = useNavigate()
  const [registros, setRegistros] = useState<CategoriaDenunciaMock[]>([])
  const [carregando, setCarregando] = useState(true)

  const carregarLista = useCallback(async () => {
    setCarregando(true)
    try {
      const linhas = await fetchComplaintCategories()
      setRegistros(linhas)
    } catch {
      toast.error('Não foi possível carregar as categorias de denúncia.')
      setRegistros([])
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    void carregarLista()
  }, [carregarLista])

  const [pagina, setPagina] = useState(1)
  const [itensPorPagina, setItensPorPagina] = useState(20)
  const [busca, setBusca] = useState('')
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'sim' | 'nao'>('todos')
  const [selecao, setSelecao] = useState<Set<string>>(() => new Set())

  const dadosFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return registros.filter((r) => {
      const matchBusca =
        q.length === 0 ||
        r.nome.toLowerCase().includes(q) ||
        plainTextFromHtml(r.descricao).toLowerCase().includes(q)
      const matchAtivo =
        filtroAtivo === 'todos' ||
        (filtroAtivo === 'sim' && r.ativo) ||
        (filtroAtivo === 'nao' && !r.ativo)
      return matchBusca && matchAtivo
    })
  }, [registros, busca, filtroAtivo])

  useEffect(() => {
    setPagina(1)
  }, [busca, filtroAtivo])

  useEffect(() => {
    const permitidos = new Set(dadosFiltrados.map((r) => r.id))
    setSelecao((prev) => new Set([...prev].filter((id) => permitidos.has(id))))
  }, [dadosFiltrados])

  const totalItens = dadosFiltrados.length
  const totalPaginas =
    totalItens <= 0 ? 1 : Math.max(1, Math.ceil(totalItens / itensPorPagina))
  const paginaSegura = Math.min(Math.max(1, pagina), totalPaginas)

  const linhas = useMemo(() => {
    const i = (paginaSegura - 1) * itensPorPagina
    return dadosFiltrados.slice(i, i + itensPorPagina)
  }, [dadosFiltrados, paginaSegura, itensPorPagina])

  const idsPagina = useMemo(() => linhas.map((r) => r.id), [linhas])
  const marcadosPagina = useMemo(() => idsPagina.filter((id) => selecao.has(id)), [idsPagina, selecao])
  const marcacaoPaginaCabecalho = estadoCabecalhoSelecaoPagina(linhas.length, marcadosPagina.length)

  const aoMudarLinhas = (n: number) => {
    setItensPorPagina(n)
    setPagina(1)
  }

  const filtrosAtivos = busca.trim().length > 0 || filtroAtivo !== 'todos'

  const limparFiltros = () => {
    setBusca('')
    setFiltroAtivo('todos')
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

  const alternarAtivoLinha = useCallback(
    async (r: CategoriaDenunciaMock) => {
      const nextActive = !r.ativo
      if (!nextActive) {
        const ok = await confirm({
          title: `Inativar a categoria "${r.nome}"?`,
          description: 'Permanece disponível para histórico.',
          variant: 'destructive',
        })
        if (!ok) return
      }
      void updateComplaintCategory(r.id, {
        name: r.nome,
        description: r.descricao || null,
        slaDays: r.slaDias,
        active: nextActive,
      }).then(
        () => {
          toast.success(nextActive ? 'Categoria ativada.' : 'Categoria inativada.')
          void carregarLista()
          setSelecao((prev) => {
            const next = new Set(prev)
            next.delete(r.id)
            return next
          })
        },
        () => {
          toast.error(
            nextActive
              ? 'Não foi possível ativar a categoria.'
              : 'Não foi possível inativar a categoria.',
          )
        },
      )
    },
    [carregarLista, confirm],
  )

  const registrosSelecionados = useMemo(
    () => registros.filter((r) => selecao.has(r.id)),
    [registros, selecao],
  )
  const algumAtivoNaSelecao = useMemo(
    () => registrosSelecionados.some((r) => r.ativo),
    [registrosSelecionados],
  )
  const qtdSelecionados = selecao.size
  const temSelecao = qtdSelecionados > 0

  const colSpanVazio = 7

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <RegistrosPageHeader
        title={
          <span className="inline-flex items-center gap-2.5">
            <span className="bg-primary/8 text-primary inline-flex size-9 shrink-0 items-center justify-center rounded-lg">
              <Tags className="size-[1.15rem]" strokeWidth={1.75} aria-hidden />
            </span>
            <span>Categoria denúncias</span>
          </span>
        }
        description="Cadastro de categorias utilizadas na classificação das denúncias (dados de referência)."
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground size-9"
              onClick={() => void carregarLista()}
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
              onClick={() => exportarCsvCategorias(dadosFiltrados)}
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
          onClick={() => navigate('/app/dados-mestres/categoria-denuncias/new?modal=true')}
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
              placeholder="Buscar nome ou descrição…"
              className="border-border/40 bg-muted/[0.92] dark:bg-muted/95 h-8 w-full border pl-8 text-[13px] shadow-none"
              aria-label="Buscar"
            />
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-nowrap items-center justify-end gap-2 sm:w-auto sm:justify-end sm:gap-2 md:gap-3">
          <Select
            value={filtroAtivo}
            onValueChange={(v) => setFiltroAtivo(v as 'todos' | 'sim' | 'nao')}
          >
            <SelectTrigger
              size="sm"
              aria-label="Ativo"
              className="border-border/40 bg-muted/[0.92] dark:bg-muted/95 h-8 w-[min(100%,10.5rem)] gap-1.5 shadow-none"
            >
              <SlidersHorizontal className="text-muted-foreground size-3 shrink-0" aria-hidden />
              <SelectValue placeholder="Ativo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="sim">Ativos</SelectItem>
              <SelectItem value="nao">Inativos</SelectItem>
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

      {temSelecao ? (
        <div
          className="border-primary/20 bg-muted/30 flex flex-col gap-2 rounded-lg border border-l-2 border-l-primary/50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
          role="status"
          aria-live="polite"
        >
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <ListChecks className="text-primary size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="text-foreground font-medium tabular-nums">{qtdSelecionados}</span>
            <span>{qtdSelecionados === 1 ? 'selecionado' : 'selecionados'}</span>
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
                  onClick={() => exportarCsvCategorias(registrosSelecionados)}
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
                  className={
                    algumAtivoNaSelecao
                      ? 'border-destructive/25 text-destructive hover:bg-destructive/10 size-8'
                      : 'size-8'
                  }
                  aria-label={
                    algumAtivoNaSelecao ? 'Inativar selecionados' : 'Ativar selecionados'
                  }
                  onClick={async () => {
                    const proxima = !algumAtivoNaSelecao
                    const ok = await confirm(
                      proxima
                        ? {
                            title: `Ativar ${qtdSelecionados} categoria(s) selecionada(s)?`,
                            variant: 'default',
                          }
                        : {
                            title: `Inativar ${qtdSelecionados} categoria(s) selecionada(s)?`,
                            description:
                              'Elas deixarão de aparecer como ativas nas seleções.',
                            variant: 'destructive',
                          },
                    )
                    if (!ok) return
                    try {
                      await Promise.all(
                        registrosSelecionados.map((r) =>
                          updateComplaintCategory(r.id, {
                            name: r.nome,
                            description: r.descricao || null,
                            slaDays: r.slaDias,
                            active: proxima,
                          }),
                        ),
                      )
                      toast.success(proxima ? 'Categorias ativadas.' : 'Categorias inativadas.')
                      void carregarLista()
                      limparSelecao()
                    } catch {
                      toast.error('Não foi possível atualizar a seleção.')
                    }
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

      <RegistrosListaPaginada
        className="mt-0"
        areaLabel="Tabela de categorias de denúncia"
        paginacao={{
          paginaAtual: paginaSegura,
          itensPorPagina,
          totalItens,
          onPaginaChange: setPagina,
          opcoesItensPorPagina: LINHAS_DADOS_MESTRES,
          onItensPorPaginaChange: aoMudarLinhas,
        }}
      >
        <Table className="border-collapse min-w-[960px] text-[13px]">
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
              <TableHead className="text-muted-foreground min-w-[8rem] px-2 py-2.5 text-left text-[11px]">
                <CabecalhoColuna icone={Tags} rotulo="Nome" />
              </TableHead>
              <TableHead className="text-muted-foreground min-w-[14rem] px-2 py-2.5 text-left text-[11px]">
                <CabecalhoColuna icone={TextAlignStart} rotulo="Descrição" />
              </TableHead>
              <TableHead className="text-muted-foreground min-w-[5rem] px-2 py-2.5 text-left text-[11px]">
                <CabecalhoColuna icone={ListOrdered} rotulo="SLA (dias)" />
              </TableHead>
              <TableHead className="text-muted-foreground min-w-[7rem] px-2 py-2.5 text-right text-[11px]">
                <CabecalhoColuna icone={ToggleLeft} rotulo="Ativo" alinhar="right" />
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
                <CabecalhoColunaAcoes />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_td]:whitespace-normal">
            {carregando ? (
              <TableRow>
                <TableCell colSpan={colSpanVazio} className="py-14 text-center">
                  <Spinner className="mx-auto size-5 text-muted-foreground/50" />
                </TableCell>
              </TableRow>
            ) : linhas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={colSpanVazio}
                  className="text-muted-foreground py-14 text-center text-sm"
                >
                  <div className="flex flex-col items-center gap-2">
                    Nenhum resultado. Ajuste filtros ou busca.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              linhas.map((r) => {
                const sel = selecao.has(r.id)
                return (
                  <TableRow
                    key={r.id}
                    data-selected={sel || undefined}
                    className={cn(
                      'group/table-row border-border/30 border-b transition-colors',
                      sel ? 'bg-muted/35' : 'hover:bg-muted/12',
                    )}
                  >
                    <TableCell className={pinTdCheckbox(sel)}>
                      <div className="flex justify-center">
                        <Checkbox
                          aria-label={`Selecionar ${r.nome}`}
                          checked={sel}
                          onCheckedChange={(v) => alternarLinha(r.id, v === true)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground min-w-[7rem] px-2 py-2.5 align-middle text-[13px] font-medium">
                      {r.nome}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[20rem] min-w-0 whitespace-normal px-2 py-2.5 align-middle text-[12px] leading-snug">
                      <CelulaTextoRico html={r.descricao} />
                    </TableCell>
                    <TableCell className="text-muted-foreground px-2 py-2.5 align-middle tabular-nums">
                      {r.slaDias > 0 ? `${r.slaDias} dias` : '—'}
                    </TableCell>
                    <TableCell className="px-2 py-2.5 text-right align-middle">
                      <CelulaValorBooleano value={r.ativo} />
                    </TableCell>
                    <TableCell className="text-muted-foreground px-2 py-2.5 align-middle tabular-nums">
                      {formatoDataHora(r.atualizadoEm)}
                    </TableCell>
                    <TableCell className={pinTdAcoes(sel)}>
                      <div className="inline-flex flex-nowrap items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className={cn(
                                'text-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border/90 bg-background',
                                'shadow-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none',
                              )}
                              aria-label={`Ver ${r.nome}`}
                              onClick={() =>
                                toast.message(r.nome, {
                                  description: textoPlanoPreview(r.descricao),
                                })
                              }
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
                              aria-label={`Editar ${r.nome}`}
                              onClick={() =>
                                navigate(`/app/dados-mestres/categoria-denuncias/${r.id}?modal=true`)
                              }
                            >
                              <PencilLine className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Editar</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className={cn(
                                r.ativo
                                  ? 'inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-destructive/40 bg-background text-destructive shadow-sm transition-colors hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-destructive/30 focus-visible:outline-none'
                                  : 'text-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border/90 bg-background shadow-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none',
                              )}
                              aria-label={r.ativo ? `Inativar ${r.nome}` : `Ativar ${r.nome}`}
                              onClick={() => alternarAtivoLinha(r)}
                            >
                              {r.ativo ? (
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
                            {r.ativo ? 'Inativar' : 'Ativar'}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </RegistrosListaPaginada>
    </div>
  )
}
