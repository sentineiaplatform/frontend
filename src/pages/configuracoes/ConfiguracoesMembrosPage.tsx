import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2Icon,
  EyeIcon,
  MailIcon,
  SearchIcon,
  ShieldIcon,
  SlidersHorizontalIcon,
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
import { appendConfigAuditLog } from '@/pages/configuracoes/configuracoes-audit-log'
import { configuracoesPageShellClass } from '@/pages/configuracoes/configuracoes-layout'
import {
  CabecalhoColuna,
  CabecalhoColunaAcoes,
  LINHAS_DADOS_MESTRES,
  pinTdAcoes,
} from '@/pages/dados-mestres/dados-mestres-listagem-shared'

type MembroMock = {
  id: string
  nome: string
  email: string
  papel: 'Administrador' | 'Triador' | 'Investigador' | 'Leitura'
  estado: 'Ativo' | 'Convite pendente'
}

const MEMBROS_MOCK: MembroMock[] = [
  {
    id: '1',
    nome: 'Ana Costa',
    email: 'ana.costa@empresa.com.br',
    papel: 'Administrador',
    estado: 'Ativo',
  },
  {
    id: '2',
    nome: 'Bruno Silva',
    email: 'bruno.silva@empresa.com.br',
    papel: 'Triador',
    estado: 'Ativo',
  },
  {
    id: '3',
    nome: 'Carla Mendes',
    email: 'carla.mendes@empresa.com.br',
    papel: 'Investigador',
    estado: 'Convite pendente',
  },
]

function badgeVariant(papel: MembroMock['papel']) {
  switch (papel) {
    case 'Administrador':
      return 'default' as const
    case 'Triador':
      return 'secondary' as const
    case 'Investigador':
      return 'outline' as const
    default:
      return 'ghost' as const
  }
}

/** Membros da organização — mock local até existir API. */
export function ConfiguracoesMembrosPage() {
  const [pagina, setPagina] = useState(1)
  const [itensPorPagina, setItensPorPagina] = useState(20)
  const [busca, setBusca] = useState('')
  const [filtroPapel, setFiltroPapel] = useState<
    'todos' | MembroMock['papel']
  >('todos')
  const [filtroEstado, setFiltroEstado] = useState<
    'todos' | MembroMock['estado']
  >('todos')

  const dadosFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return MEMBROS_MOCK.filter((m) => {
      const matchBusca =
        q.length === 0 ||
        m.nome.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
      const matchPapel = filtroPapel === 'todos' || m.papel === filtroPapel
      const matchEstado = filtroEstado === 'todos' || m.estado === filtroEstado
      return matchBusca && matchPapel && matchEstado
    })
  }, [busca, filtroPapel, filtroEstado])

  useEffect(() => {
    setPagina(1)
  }, [busca, filtroPapel, filtroEstado])

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

  const filtrosAtivos =
    busca.trim().length > 0 || filtroPapel !== 'todos' || filtroEstado !== 'todos'

  const limparFiltros = () => {
    setBusca('')
    setFiltroPapel('todos')
    setFiltroEstado('todos')
  }

  const colSpanVazio = 5

  function onInvite() {
    toast.message('Convite (simulado)', {
      description: 'Em produção, abriríamos o fluxo de convite por e-mail.',
    })
    appendConfigAuditLog({
      category: 'membros',
      action: 'Abrir convite de membro',
    })
  }

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
              <span className="text-muted-foreground bg-muted/50 border-border/50 hidden items-center rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase sm:inline-flex sm:text-[11px]">
                Pré-visualização
              </span>
            </span>
          }
          description={
            <>
              Quem tem acesso à organização neste ambiente. Os dados são de exemplo; convites e SSO
              virão com a API. As permissões detalhadas estão em{' '}
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
            onClick={onInvite}
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
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar nome ou e-mail…"
                className="border-border/40 bg-muted/[0.92] dark:bg-muted/95 h-8 w-full border pl-8 text-[13px] shadow-none"
                aria-label="Buscar membros"
              />
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap sm:justify-end md:gap-3">
            <Select
              value={filtroPapel}
              onValueChange={(v) =>
                setFiltroPapel(v as 'todos' | MembroMock['papel'])
              }
            >
              <SelectTrigger
                size="sm"
                aria-label="Filtrar por papel"
                className="border-border/40 bg-muted/[0.92] dark:bg-muted/95 h-8 w-[min(100%,11rem)] gap-1.5 shadow-none"
              >
                <SlidersHorizontalIcon className="text-muted-foreground size-3 shrink-0" aria-hidden />
                <SelectValue placeholder="Papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os papéis</SelectItem>
                <SelectItem value="Administrador">Administrador</SelectItem>
                <SelectItem value="Triador">Triador</SelectItem>
                <SelectItem value="Investigador">Investigador</SelectItem>
                <SelectItem value="Leitura">Leitura</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filtroEstado}
              onValueChange={(v) =>
                setFiltroEstado(v as 'todos' | MembroMock['estado'])
              }
            >
              <SelectTrigger
                size="sm"
                aria-label="Filtrar por estado"
                className="border-border/40 bg-muted/[0.92] dark:bg-muted/95 h-8 w-[min(100%,12rem)] gap-1.5 shadow-none"
              >
                <CheckCircle2Icon className="text-muted-foreground size-3 shrink-0" aria-hidden />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os estados</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Convite pendente">Convite pendente</SelectItem>
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
            totalItens,
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
              {linhas.length === 0 ? (
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
                linhas.map((m) => (
                  <TableRow
                    key={m.id}
                    className="group/table-row border-border/30 border-b transition-colors hover:bg-muted/12"
                  >
                    <TableCell className="text-foreground min-w-[7rem] px-2 py-2.5 align-middle text-[13px] font-medium">
                      {m.nome}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[18rem] truncate px-2 py-2.5 align-middle text-[12px] leading-snug">
                      {m.email}
                    </TableCell>
                    <TableCell className="px-2 py-2.5 align-middle">
                      <Badge variant={badgeVariant(m.papel)} className="text-[11px] font-normal">
                        {m.papel}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-2 py-2.5 text-right align-middle">
                      <Badge
                        variant={m.estado === 'Ativo' ? 'secondary' : 'outline'}
                        className={cn(
                          'text-[11px] font-normal',
                          m.estado === 'Convite pendente' &&
                            'border-amber-500/40 text-amber-700 dark:text-amber-400',
                        )}
                      >
                        {m.estado}
                      </Badge>
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
                              aria-label={`Ver ${m.nome}`}
                              onClick={() =>
                                toast.message(`Membro: ${m.nome} (simulado).`)
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
