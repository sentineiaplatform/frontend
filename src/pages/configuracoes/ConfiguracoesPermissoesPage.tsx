import { useEffect, useMemo, useState } from 'react'
import {
  KeyRoundIcon,
  ListChecksIcon,
  ListXIcon,
  SearchIcon,
  ShieldIcon,
  XIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { RegistrosPageHeader } from '@/components/registros'
import { Badge } from '@/components/ui/badge'
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
import { cn } from '@/lib/utils'
import {
  clearMatrizSalva,
  loadMatrizSalva,
  saveMatrizSalva,
} from '@/pages/configuracoes/config-permissoes-matriz'
import { appendConfigAuditLog } from '@/pages/configuracoes/configuracoes-audit-log'
import { configuracoesPageShellClass } from '@/pages/configuracoes/configuracoes-layout'
import {
  MODULOS,
  TIPO_BADGE,
  buildBaselineMatriz,
  cellKey,
  contarPermissoesAtivas,
  iterKeys,
  mergeSavedMatriz,
  type MatrizPermissoes,
  type ModuloAcao,
  type ModuloDef,
} from '@/pages/configuracoes/permissoes-modulos'
import { useConfigPerfis } from '@/pages/configuracoes/use-config-perfis'

function abreviarColuna(nome: string): string {
  const t = nome.trim()
  if (t.length <= 14) return t
  return `${t.slice(0, 12)}…`
}

const bulkIconBtnClass =
  'inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none'

function BulkIconPair({
  onMarkAll,
  onClearAll,
  markLabel,
  clearLabel,
}: Readonly<{
  onMarkAll: () => void
  onClearAll: () => void
  markLabel: string
  clearLabel: string
}>) {
  return (
    <span className="inline-flex items-center gap-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={bulkIconBtnClass}
            onClick={onMarkAll}
            aria-label={markLabel}
          >
            <ListChecksIcon className="size-3.5" strokeWidth={2} aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">{markLabel}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={bulkIconBtnClass}
            onClick={onClearAll}
            aria-label={clearLabel}
          >
            <ListXIcon className="size-3.5" strokeWidth={2} aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">{clearLabel}</TooltipContent>
      </Tooltip>
    </span>
  )
}

type FilinhaVisivel = {
  modulo: ModuloDef
  acao: ModuloAcao
  key: string
  isFirstInModule: boolean
  moduleRowSpan: number
}

function buildFilasVisiveis(query: string): FilinhaVisivel[] {
  const q = query.trim().toLowerCase()
  const flat: { modulo: ModuloDef; acao: ModuloAcao; key: string }[] = []
  for (const modulo of MODULOS) {
    for (const acao of modulo.actions) {
      flat.push({ modulo, acao, key: cellKey(modulo.id, acao.id) })
    }
  }
  const filtered =
    q === ''
      ? flat
      : flat.filter(({ modulo, acao }) => {
          const hay =
            `${modulo.label} ${modulo.hint} ${acao.label} ${acao.hint}`.toLowerCase()
          return hay.includes(q)
        })

  const out: FilinhaVisivel[] = []
  let i = 0
  while (i < filtered.length) {
    const modId = filtered[i]!.modulo.id
    let j = i
    while (j < filtered.length && filtered[j]!.modulo.id === modId) j++
    const span = j - i
    for (let k = i; k < j; k++) {
      const row = filtered[k]!
      out.push({
        modulo: row.modulo,
        acao: row.acao,
        key: row.key,
        isFirstInModule: k === i,
        moduleRowSpan: span,
      })
    }
    i = j
  }
  return out
}

/** Matriz módulo × ação × perfil (colunas dinâmicas a partir de Perfis). */
export function ConfiguracoesPermissoesPage() {
  const { perfis, ids } = useConfigPerfis()
  const [busca, setBusca] = useState('')
  const [filtroColunasPerfil, setFiltroColunasPerfil] = useState<'todos' | string>('todos')

  const perfilNomePorId = useMemo(
    () => Object.fromEntries(perfis.map((p) => [p.id, p.nome] as const)),
    [perfis],
  )

  const baseline = useMemo(
    () => buildBaselineMatriz(ids, perfilNomePorId),
    [ids, perfilNomePorId],
  )

  const [matriz, setMatriz] = useState<MatrizPermissoes>({})

  useEffect(() => {
    if (ids.length === 0) {
      setMatriz({})
      return
    }
    const b = buildBaselineMatriz(ids, perfilNomePorId)
    setMatriz(mergeSavedMatriz(loadMatrizSalva(), ids, b))
  }, [ids, perfilNomePorId])

  useEffect(() => {
    if (filtroColunasPerfil !== 'todos' && !ids.includes(filtroColunasPerfil)) {
      setFiltroColunasPerfil('todos')
    }
  }, [filtroColunasPerfil, ids])

  const filasVisiveis = useMemo(() => buildFilasVisiveis(busca), [busca])

  const perfisColunas = useMemo(() => {
    if (filtroColunasPerfil === 'todos') return perfis
    return perfis.filter((p) => p.id === filtroColunasPerfil)
  }, [perfis, filtroColunasPerfil])

  const filtrosAtivos = busca.trim().length > 0 || filtroColunasPerfil !== 'todos'
  const limparFiltros = () => {
    setBusca('')
    setFiltroColunasPerfil('todos')
  }

  const permissoesAtivas = contarPermissoesAtivas(matriz, ids)
  const ativasVisiveis = useMemo(() => {
    let n = 0
    for (const f of filasVisiveis) {
      for (const p of perfisColunas) {
        if (matriz[f.key]?.[p.id]) n += 1
      }
    }
    return n
  }, [filasVisiveis, matriz, perfisColunas])

  function setCelula(key: string, perfilId: string, value: boolean) {
    setMatriz((prev) => ({
      ...prev,
      [key]: { ...prev[key], [perfilId]: value },
    }))
  }

  /** Todas as células da matriz (todos os módulos × todos os perfis). */
  function marcarTudoGeral(on: boolean) {
    setMatriz((prev) => {
      const next: MatrizPermissoes = { ...prev }
      for (const k of iterKeys()) {
        const row = { ...(next[k] ?? {}) }
        for (const pid of ids) {
          row[pid] = on
        }
        next[k] = row
      }
      return next
    })
  }

  /** Todas as linhas de um módulo × todos os perfis. */
  function marcarModuloCompleto(moduloId: string, on: boolean) {
    const modulo = MODULOS.find((m) => m.id === moduloId)
    if (!modulo) return
    setMatriz((prev) => {
      const next: MatrizPermissoes = { ...prev }
      for (const acao of modulo.actions) {
        const k = cellKey(moduloId, acao.id)
        const row = { ...(next[k] ?? {}) }
        for (const pid of ids) {
          row[pid] = on
        }
        next[k] = row
      }
      return next
    })
  }

  /** Todas as linhas × um perfil (coluna). */
  function marcarColunaPerfil(perfilId: string, on: boolean) {
    setMatriz((prev) => {
      const next: MatrizPermissoes = { ...prev }
      for (const k of iterKeys()) {
        const row = { ...(next[k] ?? {}) }
        row[perfilId] = on
        next[k] = row
      }
      return next
    })
  }

  function onRestaurar() {
    const b = buildBaselineMatriz(ids, perfilNomePorId)
    setMatriz(b)
    clearMatrizSalva()
    toast.message('Matriz reposta', {
      description: 'Modelo por defeito aplicado; rascunho local da matriz limpo.',
    })
  }

  function onGuardar() {
    saveMatrizSalva(matriz)
    const total = contarPermissoesAtivas(matriz, ids)
    const mudancas: string[] = []
    for (const k of iterKeys()) {
      for (const pid of ids) {
        const was = baseline[k]?.[pid] ?? false
        const now = matriz[k]?.[pid] ?? false
        if (was !== now) mudancas.push(`${k}:${pid}=${now}`)
      }
    }
    toast.success('Matriz guardada', {
      description: `${total} permissões ativas · ${perfis.length} perfil(is) · ${iterKeys().length} linhas.`,
    })
    appendConfigAuditLog({
      category: 'permissoes',
      action: 'Matriz módulos × CRUD × perfis',
      detail: mudancas.length ? mudancas.slice(0, 32).join('; ') : 'Sem alterações face ao modelo inicial',
    })
  }

  const colSpanVazio = 2 + Math.max(1, perfisColunas.length)

  return (
    <div className={configuracoesPageShellClass}>
      <div className="flex flex-col gap-4 md:gap-5">
        <RegistrosPageHeader
          title={
            <span className="inline-flex items-center gap-2.5">
              <span className="bg-primary/8 text-primary inline-flex size-9 shrink-0 items-center justify-center rounded-lg">
                <KeyRoundIcon className="size-[1.15rem]" strokeWidth={1.75} aria-hidden />
              </span>
              <span>Permissões</span>
              <span className="text-muted-foreground bg-muted/50 border-border/50 hidden items-center rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase sm:inline-flex sm:text-[11px]">
                Módulos · CRUD · rascunho local
              </span>
            </span>
          }
          description={
            <>
              Por módulo, define o que cada{' '}
              <strong className="font-medium text-foreground">perfil</strong> pode fazer (CRUD e ações
              específicas). As colunas refletem os perfis em{' '}
              <Link
                to="/app/configuracoes/perfis"
                className="text-primary underline-offset-3 hover:underline"
              >
                Perfis
              </Link>{' '}
              (incluindo os que criares); novos perfis começam sem permissões até marcares as células.
            </>
          }
        >
          <Button type="button" variant="outline" size="sm" className="h-9 rounded-lg px-3" onClick={onRestaurar}>
            Repor modelo
          </Button>
          <Button type="button" size="sm" className="h-9 rounded-lg px-3" onClick={onGuardar}>
            Guardar rascunho
          </Button>
        </RegistrosPageHeader>

        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border/40 pb-3 text-[11px] md:text-xs">
          <span className="inline-flex items-center gap-1">
            <Badge variant="outline" className="font-mono px-1 py-0 text-[10px]" title="Criar">
              C
            </Badge>
            <Badge variant="outline" className="font-mono px-1 py-0 text-[10px]" title="Ler">
              R
            </Badge>
            <Badge variant="outline" className="font-mono px-1 py-0 text-[10px]" title="Atualizar">
              U
            </Badge>
            <Badge variant="outline" className="font-mono px-1 py-0 text-[10px]" title="Eliminar">
              D
            </Badge>
            <span>CRUD</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Badge variant="secondary" className="font-mono px-1 py-0 text-[10px]" title="Outra ação">
              ±
            </Badge>
            <span>Outras ações do módulo</span>
          </span>
          <span className="text-border hidden h-3 w-px shrink-0 bg-border sm:block" aria-hidden />
          <BulkIconPair
            onMarkAll={() => marcarTudoGeral(true)}
            onClearAll={() => marcarTudoGeral(false)}
            markLabel="Marcar toda a matriz (todos os perfis)"
            clearLabel="Limpar toda a matriz (todos os perfis)"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-center sm:justify-between sm:gap-2 sm:overflow-x-auto md:gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-nowrap md:min-h-10 md:flex-1 md:min-w-0">
            <div className="relative w-full max-w-[17.5rem] min-w-0 shrink sm:max-w-[15rem] md:max-w-[17.5rem]">
              <SearchIcon
                className="text-muted-foreground/70 pointer-events-none absolute top-1/2 left-2.5 size-[0.95rem] -translate-y-1/2"
                aria-hidden
                strokeWidth={1.75}
              />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar módulo ou permissão…"
                className="border-border/40 bg-muted/[0.92] dark:bg-muted/95 h-8 w-full border pl-8 text-[13px] shadow-none"
                aria-label="Buscar na matriz"
              />
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap md:gap-3">
            <Select value={filtroColunasPerfil} onValueChange={setFiltroColunasPerfil}>
              <SelectTrigger
                size="sm"
                aria-label="Perfis visíveis como colunas"
                className="border-border/40 bg-muted/[0.92] dark:bg-muted/95 h-8 w-[min(100%,14rem)] gap-1.5 shadow-none"
              >
                <ShieldIcon className="text-muted-foreground size-3 shrink-0" aria-hidden />
                <SelectValue placeholder="Colunas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os perfis</SelectItem>
                {perfis.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    Só: {p.nome}
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
                <XIcon className="size-3" strokeWidth={2} aria-hidden />
                Limpar
              </Button>
            ) : null}

            {filtrosAtivos ? (
              <p className="text-muted-foreground shrink-0 text-right text-[11px] sm:text-xs">
                {filasVisiveis.length}{' '}
                {filasVisiveis.length === 1 ? 'linha visível' : 'linhas visíveis'}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-0">
          <section
            aria-label="Matriz de permissões por perfil"
            className="border-border/40 bg-background overflow-hidden rounded-xl border"
          >
            <div className="relative max-w-full overflow-x-auto">
              <Table className="min-w-[42rem] table-fixed">
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent border-b bg-muted/[0.92] [&_th]:align-bottom">
                    <TableHead className="sticky left-0 z-[3] w-[8.5rem] bg-muted/[0.92] px-2 backdrop-blur-sm sm:w-[10rem]">
                      <span className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                        Módulo
                      </span>
                    </TableHead>
                    <TableHead className="sticky left-[8.5rem] z-[3] w-[min(11rem,30vw)] border-r border-border/40 bg-muted/[0.92] px-2 backdrop-blur-sm sm:left-[10rem] sm:w-[13rem]">
                      <span className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                        Permissão
                      </span>
                    </TableHead>
                    {perfisColunas.map((p) => (
                      <TableHead key={p.id} className="w-[5.5rem] px-1 pb-2 text-center sm:w-[7rem]">
                        <div className="flex flex-col items-center gap-1.5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex cursor-default flex-col items-center gap-1">
                                <span
                                  className="text-foreground line-clamp-2 text-[11px] font-semibold leading-tight sm:text-xs"
                                  title={p.nome}
                                >
                                  <span className="sm:hidden">{abreviarColuna(p.nome)}</span>
                                  <span className="hidden sm:inline">{p.nome}</span>
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-xs">
                              <p className="font-medium">{p.nome}</p>
                              <p className="text-muted-foreground mt-1 text-xs">
                                {p.descricao || 'Sem descrição.'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                          <BulkIconPair
                            onMarkAll={() => marcarColunaPerfil(p.id, true)}
                            onClearAll={() => marcarColunaPerfil(p.id, false)}
                            markLabel={`Marcar todas as linhas para ${p.nome}`}
                            clearLabel={`Limpar todas as linhas para ${p.nome}`}
                          />
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filasVisiveis.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={colSpanVazio}
                        className="text-muted-foreground py-14 text-center text-sm"
                      >
                        Nenhuma linha corresponde à busca. Limpe ou ajuste o texto.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filasVisiveis.map((filinha, vi) => {
                      const badge = TIPO_BADGE[filinha.acao.tipo]
                      return (
                        <TableRow
                          key={filinha.key}
                          className={cn(
                            filinha.isFirstInModule && vi > 0 && 'border-t-2 border-border/50',
                            filinha.isFirstInModule && 'bg-muted/15',
                          )}
                        >
                          {filinha.isFirstInModule ? (
                            <TableCell
                              rowSpan={filinha.moduleRowSpan}
                              className="bg-background sticky left-0 z-[2] align-top border-r border-border/50 px-2 py-3 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.08)] sm:px-3 dark:shadow-[2px_0_10px_-4px_rgba(0,0,0,0.35)]"
                            >
                              <p className="text-foreground text-sm font-semibold leading-snug">
                                {filinha.modulo.label}
                              </p>
                              <p className="text-muted-foreground mt-1 text-[11px] leading-snug">
                                {filinha.modulo.hint}
                              </p>
                              <div className="mt-2 border-t border-border/40 pt-2">
                                <BulkIconPair
                                  onMarkAll={() => marcarModuloCompleto(filinha.modulo.id, true)}
                                  onClearAll={() => marcarModuloCompleto(filinha.modulo.id, false)}
                                  markLabel={`Marcar todo o módulo ${filinha.modulo.label}`}
                                  clearLabel={`Limpar todo o módulo ${filinha.modulo.label}`}
                                />
                              </div>
                            </TableCell>
                          ) : null}
                          <TableCell className="bg-background sticky left-[8.5rem] z-[3] border-r border-border/50 px-2 py-2.5 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.06)] sm:left-[10rem] sm:px-3 dark:shadow-[2px_0_10px_-4px_rgba(0,0,0,0.3)]">
                            <div className="flex min-w-0 items-start gap-2">
                              <Badge
                                variant={filinha.acao.tipo === 'other' ? 'secondary' : 'outline'}
                                className="mt-0.5 shrink-0 px-1 py-0 font-mono text-[10px]"
                                title={badge.title}
                              >
                                {badge.short}
                              </Badge>
                              <div className="min-w-0">
                                <p className="text-foreground text-sm font-medium leading-snug">
                                  {filinha.acao.label}
                                </p>
                                <p className="text-muted-foreground mt-0.5 text-[11px] leading-snug">
                                  {filinha.acao.hint}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          {perfisColunas.map((p) => {
                            const checked = matriz[filinha.key]?.[p.id] ?? false
                            return (
                              <TableCell key={p.id} className="p-0 text-center align-middle">
                                <div className="flex min-h-[3rem] items-center justify-center py-1">
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(v) => setCelula(filinha.key, p.id, v === true)}
                                    aria-label={`${p.nome} — ${filinha.modulo.label} — ${filinha.acao.label}`}
                                    className="size-[18px]"
                                  />
                                </div>
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </section>

          <footer className="border-border/40 text-muted-foreground flex flex-col gap-2 border-t pt-4 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p>
              <span className="text-foreground font-medium tabular-nums">{perfis.length}</span> perfil(is)
              na organização ·{' '}
              <span className="text-foreground font-medium tabular-nums">{permissoesAtivas}</span> permissões
              ativas no total
              {filtrosAtivos ? (
                <>
                  {' '}
                  ·{' '}
                  <span className="text-foreground font-medium tabular-nums">{ativasVisiveis}</span> ativas nas
                  linhas/colunas visíveis
                </>
              ) : null}
            </p>
            <p className="text-[11px] sm:text-xs">
              Ícones na legenda, por módulo e por coluna: marcar tudo (lista com visto) ou limpar (lista com X). Ações
              globais e por módulo aplicam a todos os perfis. Guardar grava a matriz completa.
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}
