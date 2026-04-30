import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CircleUserRoundIcon,
  FileTextIcon,
  PlusIcon,
  SearchIcon,
  ShieldIcon,
  SlidersHorizontalIcon,
  TextAlignStartIcon,
  Trash2Icon,
  UserIcon,
  XIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import {
  GenericCrudForm,
  type CrudFormField,
} from '@/components/forms/generic-crud-form'
import { RegistrosListaPaginada, RegistrosPageHeader } from '@/components/registros'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import {
  type PerfilCreateValues,
  perfilCreateSchema,
} from '@/pages/configuracoes/perfis-schema'
import { useConfigPerfis } from '@/pages/configuracoes/use-config-perfis'

const perfilCrudFields: CrudFormField<PerfilCreateValues>[] = [
  {
    type: 'text',
    name: 'nome',
    label: 'Nome',
    placeholder: 'Ex.: Auditor interno',
    icon: UserIcon,
  },
  {
    type: 'textarea',
    name: 'descricao',
    label: 'Descrição (opcional)',
    placeholder: 'Para que serve este perfil…',
    icon: TextAlignStartIcon,
  },
]

/** Perfis da organização — listagem e criação em modal (pré-backend). */
export function ConfiguracoesPerfisPage() {
  const { perfis, criar, remover } = useConfigPerfis()
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [pagina, setPagina] = useState(1)
  const [itensPorPagina, setItensPorPagina] = useState(20)
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'sistema' | 'personalizado'>('todos')

  const form = useForm<PerfilCreateValues>({
    resolver: zodResolver(perfilCreateSchema),
    defaultValues: { nome: '', descricao: '' },
  })

  const dadosFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return perfis.filter((p) => {
      const matchBusca =
        q.length === 0 ||
        p.nome.toLowerCase().includes(q) ||
        (p.descricao ?? '').toLowerCase().includes(q)
      const matchTipo =
        filtroTipo === 'todos' ||
        (filtroTipo === 'sistema' && p.sistema) ||
        (filtroTipo === 'personalizado' && !p.sistema)
      return matchBusca && matchTipo
    })
  }, [perfis, busca, filtroTipo])

  useEffect(() => {
    setPagina(1)
  }, [busca, filtroTipo])

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

  const filtrosAtivos = busca.trim().length > 0 || filtroTipo !== 'todos'
  const limparFiltros = () => {
    setBusca('')
    setFiltroTipo('todos')
  }

  const colSpanVazio = 4

  function abrirModal() {
    form.reset({ nome: '', descricao: '' })
    setModalOpen(true)
  }

  function fecharModal() {
    setModalOpen(false)
    form.reset({ nome: '', descricao: '' })
  }

  function onSubmit(values: PerfilCreateValues) {
    criar(values.nome, values.descricao)
    toast.success('Perfil criado', {
      description: 'Aparece como coluna em Permissões; edite a matriz para definir o que pode fazer.',
    })
    appendConfigAuditLog({
      category: 'perfis',
      action: 'Perfil criado',
      detail: values.nome.trim(),
    })
    fecharModal()
  }

  function confirmarEliminar() {
    if (!deleteId) return
    const p = perfis.find((x) => x.id === deleteId)
    const ok = remover(deleteId)
    setDeleteId(null)
    if (!ok) {
      toast.error('Não foi possível remover', { description: 'Perfis de sistema estão protegidos.' })
      return
    }
    toast.message('Perfil removido', { description: p?.nome })
    appendConfigAuditLog({
      category: 'perfis',
      action: 'Perfil removido',
      detail: p?.nome,
    })
  }

  return (
    <div className={configuracoesPageShellClass}>
      <div className="flex flex-col gap-4 md:gap-5">
        <RegistrosPageHeader
          title={
            <span className="inline-flex items-center gap-2.5">
              <span className="bg-primary/8 text-primary inline-flex size-9 shrink-0 items-center justify-center rounded-lg">
                <CircleUserRoundIcon className="size-[1.15rem]" strokeWidth={1.75} aria-hidden />
              </span>
              <span>Perfis</span>
              <span className="text-muted-foreground bg-muted/50 border-border/50 hidden items-center rounded-md border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase sm:inline-flex sm:text-[11px]">
                Armazenamento local
              </span>
            </span>
          }
          description={
            <>
              Papéis configuráveis da organização (além da sua{' '}
              <Link
                to="/app/configuracoes/perfil"
                className="text-primary underline-offset-3 hover:underline"
              >
                Conta
              </Link>
              ). As colunas da matriz em{' '}
              <Link
                to="/app/configuracoes/permissoes"
                className="text-primary underline-offset-3 hover:underline"
              >
                Permissões
              </Link>{' '}
              seguem estes perfis. Os quatro primeiros são de sistema e não podem ser eliminados.
            </>
          }
        >
          <Button
            type="button"
            variant="default"
            size="sm"
            className="h-9 gap-1.5 rounded-lg px-3"
            onClick={abrirModal}
          >
            <PlusIcon className="size-3.5" strokeWidth={2} aria-hidden />
            Novo perfil
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
                placeholder="Buscar nome ou descrição…"
                className="border-border/40 bg-muted/[0.92] dark:bg-muted/95 h-8 w-full border pl-8 text-[13px] shadow-none"
                aria-label="Buscar perfis"
              />
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-nowrap items-center justify-end gap-2 sm:w-auto sm:justify-end sm:gap-2 md:gap-3">
            <Select
              value={filtroTipo}
              onValueChange={(v) => setFiltroTipo(v as 'todos' | 'sistema' | 'personalizado')}
            >
              <SelectTrigger
                size="sm"
                aria-label="Tipo de perfil"
                className="border-border/40 bg-muted/[0.92] dark:bg-muted/95 h-8 w-[min(100%,11rem)] gap-1.5 shadow-none"
              >
                <SlidersHorizontalIcon className="text-muted-foreground size-3 shrink-0" aria-hidden />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="sistema">Sistema</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
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
          areaLabel="Tabela de perfis"
          paginacao={{
            paginaAtual: paginaSegura,
            itensPorPagina,
            totalItens,
            onPaginaChange: setPagina,
            opcoesItensPorPagina: LINHAS_DADOS_MESTRES,
            onItensPorPaginaChange: aoMudarLinhas,
          }}
        >
          <Table className="border-collapse min-w-[720px] text-[13px]">
            <TableHeader className="bg-muted/[0.92] [&_th]:whitespace-normal [&_tr:hover]:bg-transparent">
              <TableRow className="border-border/40 hover:bg-transparent border-b">
                <TableHead className="text-muted-foreground min-w-[9rem] px-2 py-2.5 text-left text-[11px]">
                  <CabecalhoColuna icone={UserIcon} rotulo="Nome" />
                </TableHead>
                <TableHead className="text-muted-foreground min-w-[14rem] px-2 py-2.5 text-left text-[11px]">
                  <CabecalhoColuna icone={TextAlignStartIcon} rotulo="Descrição" />
                </TableHead>
                <TableHead className="text-muted-foreground min-w-[7rem] px-2 py-2.5 text-left text-[11px]">
                  <CabecalhoColuna icone={ShieldIcon} rotulo="Tipo" />
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
                linhas.map((p) => (
                  <TableRow
                    key={p.id}
                    className="group/table-row border-border/30 border-b transition-colors hover:bg-muted/12"
                  >
                    <TableCell className="text-foreground min-w-[7rem] px-2 py-2.5 align-middle text-[13px] font-medium">
                      {p.nome}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[24rem] px-2 py-2.5 align-middle text-[12px] leading-snug">
                      {p.descricao || '—'}
                    </TableCell>
                    <TableCell className="px-2 py-2.5 align-middle">
                      {p.sistema ? (
                        <Badge variant="secondary" className="text-[11px] font-normal">
                          Sistema
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[11px] font-normal">
                          Personalizado
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className={pinTdAcoes(false)}>
                      <div className="inline-flex flex-nowrap items-center justify-end gap-1">
                        {p.sistema ? (
                          <span className="text-muted-foreground px-1 text-xs">—</span>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                className="border-destructive/25 text-destructive hover:bg-destructive/10 size-8"
                                aria-label={`Remover ${p.nome}`}
                                onClick={() => setDeleteId(p.id)}
                              >
                                <Trash2Icon className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Eliminar perfil</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </RegistrosListaPaginada>
      </div>

      {modalOpen ? (
        <GenericCrudForm
          presentation="modal"
          title="Novo perfil"
          description="Nome e descrição para identificar o papel na organização. Depois define permissões na matriz."
          headerIcon={CircleUserRoundIcon}
          headerDescriptionIcon={FileTextIcon}
          submitLabel="Criar perfil"
          fieldColumns={1}
          form={form}
          fields={perfilCrudFields}
          onSubmit={onSubmit}
          onCancel={fecharModal}
        />
      ) : null}

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar perfil?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove o perfil da lista. As colunas correspondentes desaparecem da matriz em Permissões; valores
              guardados para esse perfil deixam de aplicar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmarEliminar}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
