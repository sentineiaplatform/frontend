import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2Icon,
  EyeIcon,
  MailIcon,
  SearchIcon,
  ShieldIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { RegistrosListaPaginada, RegistrosPageHeader } from '@/components/registros'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
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
import { AuthRequestError } from '@/services/auth/types'
import {
  fetchUsersList,
  type UserListItemDto,
} from '@/services/user-profile-service'
import { configuracoesPageShellClass } from '@/pages/configuracoes/configuracoes-layout'
import {
  CabecalhoColuna,
  CabecalhoColunaAcoes,
  CelulaValorBooleano,
  LINHAS_DADOS_MESTRES,
  pinTdAcoes,
} from '@/pages/dados-mestres/dados-mestres-listagem-shared'

function membrosErrorMessage(err: unknown): string {
  if (err instanceof AuthRequestError) return err.message
  return 'Não foi possível carregar a lista de membros.'
}

const SKELETON_ROWS = 8

/** Membros da organização — dados de `GET /api/users`. */
export function ConfiguracoesMembrosPage() {
  const [membros, setMembros] = useState<UserListItemDto[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [pagina, setPagina] = useState(1)
  const [itensPorPagina, setItensPorPagina] = useState(20)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setFetchError(null)
      try {
        const list = await fetchUsersList()
        if (!cancelled) setMembros(list)
      } catch (e) {
        const msg = membrosErrorMessage(e)
        if (!cancelled) {
          setMembros([])
          setFetchError(msg)
          toast.error(msg)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const dadosFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return membros.filter((m) => {
      if (q.length === 0) return true
      return (
        m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
      )
    })
  }, [membros, busca])

  const totalItens = dadosFiltrados.length
  const totalPaginas =
    totalItens <= 0 ? 1 : Math.max(1, Math.ceil(totalItens / itensPorPagina))
  const paginaSegura = Math.min(Math.max(1, pagina), totalPaginas)

  const linhas = useMemo(() => {
    const i = (paginaSegura - 1) * itensPorPagina
    return dadosFiltrados.slice(i, i + itensPorPagina)
  }, [dadosFiltrados, paginaSegura, itensPorPagina])

  const aoMudarLinhas = (n: number) => {
    setItensPorPagina(n)
    setPagina(1)
  }

  const filtrosAtivos = busca.trim().length > 0

  const limparFiltros = () => {
    setBusca('')
  }

  const colSpanVazio = 5

  return (
    <div className={configuracoesPageShellClass}>
      <div className="flex flex-col gap-4 md:gap-5">
        <RegistrosPageHeader
          title={
            <span className="inline-flex items-center gap-2.5">
              <span className="bg-primary/8 text-primary inline-flex size-9 shrink-0 items-center justify-center rounded-lg">
                <UsersIcon className="size-[1.15rem]" strokeWidth={1.75} aria-hidden />
              </span>
              <span>Membros</span>
            </span>
          }
          description={
            <>
              Contas com acesso à aplicação (origem: servidor). Papéis organizacionais e convites
              por e-mail dependem de evolução da API. Permissões detalhadas em{' '}
              <Link
                to="/app/configuracoes/permissoes"
                className="text-primary underline-offset-3 hover:underline"
              >
                Permissões
              </Link>
              .
            </>
          }
        >
          <Button
            type="button"
            variant="default"
            size="sm"
            className="h-9 gap-1.5 rounded-lg px-3"
            disabled
            title="Convites por API ainda não estão disponíveis no servidor."
            aria-disabled
          >
            <UserPlusIcon className="size-3.5" strokeWidth={2} aria-hidden />
            Convidar membro
          </Button>
        </RegistrosPageHeader>

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
                onChange={(e) => {
                  setBusca(e.target.value)
                  setPagina(1)
                }}
                placeholder="Buscar nome ou e-mail…"
                className="border-border/40 bg-muted/[0.92] dark:bg-muted/95 h-8 w-full border pl-8 text-[13px] shadow-none"
                aria-label="Buscar membros"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap sm:justify-end md:gap-3">
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
                {totalItens} {totalItens === 1 ? 'resultado' : 'resultados'}
              </p>
            ) : null}
          </div>
        </div>

        <RegistrosListaPaginada
          className="mt-0"
          areaLabel="Tabela de membros"
          paginacao={{
            paginaAtual: paginaSegura,
            itensPorPagina,
            totalItens: loading ? 0 : totalItens,
            onPaginaChange: setPagina,
            opcoesItensPorPagina: LINHAS_DADOS_MESTRES,
            onItensPorPaginaChange: aoMudarLinhas,
          }}
        >
          <Table className="border-collapse min-w-[880px] text-[13px]">
            <TableHeader className="bg-muted/[0.92] [&_th]:whitespace-normal [&_tr:hover]:bg-transparent">
              <TableRow className="border-border/40 hover:bg-transparent border-b">
                <TableHead className="text-muted-foreground min-w-[9rem] px-2 py-2.5 text-left text-[11px]">
                  <CabecalhoColuna icone={UserIcon} rotulo="Nome" />
                </TableHead>
                <TableHead className="text-muted-foreground min-w-[14rem] px-2 py-2.5 text-left text-[11px]">
                  <CabecalhoColuna icone={MailIcon} rotulo="E-mail" />
                </TableHead>
                <TableHead className="text-muted-foreground min-w-[8rem] px-2 py-2.5 text-left text-[11px]">
                  <CabecalhoColuna icone={ShieldIcon} rotulo="Papel" />
                </TableHead>
                <TableHead className="text-muted-foreground min-w-[8rem] px-2 py-2.5 text-right text-[11px]">
                  <CabecalhoColuna icone={CheckCircle2Icon} rotulo="Estado" alinhar="right" />
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
              {loading ? (
                Array.from({ length: SKELETON_ROWS }, (_, idx) => (
                  <TableRow key={`sk-${idx}`} className="border-border/30 border-b">
                    <TableCell className="px-2 py-2.5">
                      <Skeleton className="h-4 w-[min(100%,10rem)]" />
                    </TableCell>
                    <TableCell className="px-2 py-2.5">
                      <Skeleton className="h-4 w-[min(100%,14rem)]" />
                    </TableCell>
                    <TableCell className="px-2 py-2.5">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </TableCell>
                    <TableCell className="px-2 py-2.5 text-right">
                      <Skeleton className="ml-auto h-5 w-14 rounded-full" />
                    </TableCell>
                    <TableCell className={pinTdAcoes(false)}>
                      <Skeleton className="ml-auto size-8 shrink-0 rounded-md" />
                    </TableCell>
                  </TableRow>
                ))
              ) : fetchError ? (
                <TableRow>
                  <TableCell
                    colSpan={colSpanVazio}
                    className="text-muted-foreground py-14 text-center text-sm"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p>{fetchError}</p>
                      <p className="text-[12px]">Atualize a página ou verifique a sessão.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : linhas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={colSpanVazio}
                    className="text-muted-foreground py-14 text-center text-sm"
                  >
                    <div className="flex flex-col items-center gap-2">
                      {membros.length === 0 ? (
                        <>
                          Nenhum utilizador encontrado.
                          <span className="text-[12px]">
                            Os utilizadores aparecem aqui após registo no sistema.
                          </span>
                        </>
                      ) : (
                        <>Nenhum resultado. Ajuste a busca.</>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                linhas.map((m) => (
                  <TableRow
                    key={m.id}
                    className="group/table-row border-border/30 border-b transition-colors hover:bg-muted/12"
                  >
                    <TableCell className="text-foreground min-w-[7rem] px-2 py-2.5 align-middle text-[13px] font-medium">
                      {m.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[18rem] truncate px-2 py-2.5 align-middle text-[12px] leading-snug">
                      {m.email}
                    </TableCell>
                    <TableCell className="px-2 py-2.5 align-middle">
                      <Badge variant="ghost" className="text-muted-foreground text-[11px] font-normal">
                        —
                      </Badge>
                    </TableCell>
                    <TableCell className="px-2 py-2.5 text-right align-middle">
                      <CelulaValorBooleano value />
                    </TableCell>
                    <TableCell className={pinTdAcoes(false)}>
                      <div className="inline-flex flex-nowrap items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className={cn(
                                'text-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border/90 bg-background',
                                'shadow-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none',
                              )}
                              aria-label={`Ver ${m.name}`}
                              onClick={() =>
                                toast.message(m.name, {
                                  description: m.email,
                                })
                              }
                            >
                              <EyeIcon className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Ver detalhes</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </RegistrosListaPaginada>
      </div>
    </div>
  )
}
