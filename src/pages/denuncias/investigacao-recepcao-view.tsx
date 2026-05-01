import {
  AlertCircle,
  AlertTriangle,
  Bot,
  Building2,
  Cog,
  FileSearch,
  FileText,
  GitCompare,
  Hash,
  History,
  Link2,
  ListFilter,
  Megaphone,
  MessageSquare,
  Scale,
  SendHorizontal,
  ShieldAlert,
  Sparkles,
  Tags,
  Tag,
  UserPlus,
  UserRound,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import { InvestigacaoPainelConteudoOriginal } from '@/pages/denuncias/investigacao-painel-conteudo-original'
import { InvestigacaoWorkspaceSecao } from '@/pages/denuncias/investigacao-workspace-secao'
import {
  InvestigacaoWorkspaceShell,
  type InvestigacaoShellVoltar,
} from '@/pages/denuncias/investigacao-workspace-shell'
import type { WorkflowRuntimeStep } from '@/pages/denuncias/workflow-runtime'

const CATEGORIAS_BASE = ['Assédio', 'Fraude', 'Ética', 'Compliance', 'Outros'] as const

const SUBCATEGORIAS: Record<(typeof CATEGORIAS_BASE)[number], string[]> = {
  Assédio: ['Moral', 'Sexual', 'Discriminação', 'Outro'],
  Fraude: ['Suborno', 'Desvio', 'Conflito de interesse', 'Outro'],
  Ética: ['Conduta', 'Integridade', 'Outro'],
  Compliance: ['Política interna', 'Regulamentar', 'Outro'],
  Outros: ['A classificar', 'Misto'],
}

const AREAS_ENVOLVIDAS = ['Financeiro', 'RH', 'TI', 'Operações', 'Compliance', 'Jurídico', 'Outra']

const RISCOS_OPCOES = [
  { id: 'reputacional', label: 'Reputacional', Icon: Megaphone },
  { id: 'legal', label: 'Legal / regulatório', Icon: Scale },
  { id: 'operacional', label: 'Operacional', Icon: Cog },
  { id: 'seguranca', label: 'Segurança / SST', Icon: ShieldAlert },
  { id: 'financeiro', label: 'Financeiro', Icon: Wallet },
] as const

const MOCK_RESPONSAVEIS = ['Maria Silva · Compliance', 'João Costa · RH', 'Equipa triagem · Pool']

const MOCK_SIMILARES = [
  { protocolo: 'DEN-2026-00388', score: 0.82, motivo: 'Mesmo departamento · tema assédio moral' },
  { protocolo: 'DEN-2026-00341', score: 0.61, motivo: 'Referências a reuniões com clientes' },
]

type Envolvido = {
  id: string
  nome: string
  cargo: string
  area: string
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

function mapCategoriaInicial(cat: string): (typeof CATEGORIAS_BASE)[number] {
  const n = cat.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
  if (n.includes('assedio') || n.includes('discrimin')) return 'Assédio'
  if (n.includes('fraude') || n.includes('corrup')) return 'Fraude'
  if (n.includes('seguranca') || n.includes('informacao')) return 'Compliance'
  if (n.includes('conflito') || n.includes('etica')) return 'Ética'
  return 'Outros'
}

export type InvestigacaoRecepcaoViewProps = Readonly<{
  denuncia: DenunciaMock
  steps: WorkflowRuntimeStep[]
  visualFlowOrder: number[]
  suggestedVisualPos: number
  workspaceVisualPos: number
  setWorkspaceStepIndex: (stepIndex: number) => void
  voltarPara?: InvestigacaoShellVoltar
}>

export function InvestigacaoRecepcaoView({
  denuncia,
  steps,
  visualFlowOrder,
  suggestedVisualPos,
  workspaceVisualPos,
  setWorkspaceStepIndex,
  voltarPara,
}: InvestigacaoRecepcaoViewProps) {
  const catInicial = mapCategoriaInicial(denuncia.categoria)
  const [categoria, setCategoria] = useState<(typeof CATEGORIAS_BASE)[number]>(catInicial)
  const [subcategoria, setSubcategoria] = useState(() => SUBCATEGORIAS[catInicial][0]!)
  const [gravidade, setGravidade] = useState<'baixa' | 'media' | 'alta' | 'critica'>('media')
  const [areaEnvolvida, setAreaEnvolvida] = useState(() => {
    const d = denuncia.departamento.toLowerCase()
    return AREAS_ENVOLVIDAS.find((a) => d.includes(a.toLowerCase())) ?? 'Outra'
  })
  const [riscos, setRiscos] = useState<Record<string, boolean>>({})
  const [tagsLivres, setTagsLivres] = useState('')
  const [envolvidos, setEnvolvidos] = useState<Envolvido[]>([])
  const [utilizadorInternoMock, setUtilizadorInternoMock] = useState<string | undefined>(undefined)
  const [comentarios, setComentarios] = useState<ComentarioInterno[]>([
    {
      id: 'c0',
      autor: 'triagem.pool',
      quando: denuncia.atualizadoEm,
      texto: 'Entrada validada — aguarda classificação inicial.',
    },
  ])
  const [novoComentario, setNovoComentario] = useState('')
  const [sugestaoIa, setSugestaoIa] = useState<{
    categoria?: string
    risco?: string
    passos?: string
  } | null>(null)
  const [iaAssistenteAberto, setIaAssistenteAberto] = useState(false)

  useEffect(() => {
    const subs = SUBCATEGORIAS[categoria]
    setSubcategoria((s) => (subs.includes(s) ? s : subs[0]!))
  }, [categoria])

  const alternarRisco = useCallback((id: string) => {
    setRiscos((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const aplicarSugestaoClassificacao = useCallback(() => {
    setCategoria('Assédio')
    setSubcategoria('Moral')
    setGravidade('alta')
    setRiscos((r) => ({ ...r, reputacional: true, legal: true }))
    toast.success('Sugestão aplicada (mock)', { description: 'Categoria e riscos atualizados.' })
  }, [])

  const adicionarEnvolvido = useCallback(() => {
    setEnvolvidos((list) => [
      ...list,
      {
        id: `e-${Date.now()}`,
        nome: '',
        cargo: '',
        area: '',
        tipo: 'denunciado',
      },
    ])
  }, [])

  const publicarComentario = useCallback(() => {
    const t = novoComentario.trim()
    if (!t) {
      toast.message('Escreva um comentário.')
      return
    }
    setComentarios((c) => [
      ...c,
      {
        id: `c-${Date.now()}`,
        autor: 'utilizador.mock',
        quando: new Date().toISOString().slice(0, 19),
        texto: t,
      },
    ])
    setNovoComentario('')
    toast.message('Comentário registado (mock)')
  }, [novoComentario])

  return (
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
              <InvestigacaoWorkspaceSecao
                variant="formulario"
                titulo="Classificação inicial"
                subtitulo="Alinhar ao relato antes de encaminhar."
                tituloIcon={<ListFilter className="size-[1.05rem] sm:size-[1.15rem]" strokeWidth={2} aria-hidden />}
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-1.5 text-[11px]">
                      <Tags className="text-muted-foreground size-3 shrink-0" aria-hidden />
                      Categoria
                    </Label>
                    <Select
                      value={categoria}
                      onValueChange={(v) => setCategoria(v as (typeof CATEGORIAS_BASE)[number])}
                    >
                      <SelectTrigger className="h-8 w-full text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIAS_BASE.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="flex items-center gap-1.5 text-[11px]">
                      <Tag className="text-muted-foreground size-3 shrink-0" aria-hidden />
                      Subcategoria
                    </Label>
                    <Select value={subcategoria} onValueChange={setSubcategoria}>
                      <SelectTrigger className="h-8 w-full text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBCATEGORIAS[categoria].map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="flex items-center gap-1.5 text-[11px]">
                      <AlertTriangle className="text-muted-foreground size-3 shrink-0" aria-hidden />
                      Gravidade
                    </Label>
                    <Select value={gravidade} onValueChange={(v) => setGravidade(v as typeof gravidade)}>
                      <SelectTrigger className="h-8 w-full text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="critica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="flex items-center gap-1.5 text-[11px]">
                      <Building2 className="text-muted-foreground size-3 shrink-0" aria-hidden />
                      Área envolvida
                    </Label>
                    <Select value={areaEnvolvida} onValueChange={setAreaEnvolvida}>
                      <SelectTrigger className="h-8 w-full text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AREAS_ENVOLVIDAS.map((a) => (
                          <SelectItem key={a} value={a}>
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-1.5 text-[11px]">
                    <ShieldAlert className="text-muted-foreground size-3 shrink-0" aria-hidden />
                    Tipo de risco
                  </Label>
                  <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                    {RISCOS_OPCOES.map((r) => {
                      const RiscoIcon = r.Icon
                      return (
                        <label key={r.id} className="flex cursor-pointer items-center gap-1.5 text-[11px]">
                          <Checkbox
                            className="size-3.5"
                            checked={Boolean(riscos[r.id])}
                            onCheckedChange={() => alternarRisco(r.id)}
                          />
                          <RiscoIcon className="text-muted-foreground size-3 shrink-0 opacity-90" aria-hidden />
                          {r.label}
                        </label>
                      )
                    })}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="tags-rececao" className="flex items-center gap-1.5 text-[11px]">
                    <Hash className="text-muted-foreground size-3 shrink-0" aria-hidden />
                    Tags
                  </Label>
                  <Input
                    id="tags-rececao"
                    placeholder="reunião, cliente…"
                    value={tagsLivres}
                    onChange={(e) => setTagsLivres(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </InvestigacaoWorkspaceSecao>

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
        </>
      }
      rightColumn={
        <>
          <InvestigacaoWorkspaceSecao
            variant="formulario"
            density="compact"
            titulo="Envolvidos citados"
            subtitulo="Registo interno."
            tituloIcon={<Users className="size-[1rem] sm:size-[1.05rem]" strokeWidth={2} aria-hidden />}
          >
            <div className="flex flex-wrap gap-1">
              {envolvidos.map((e) => (
                <Badge key={e.id} variant="outline" className="h-6 gap-1 pr-1 text-[11px] font-normal">
                  <Avatar className="size-4">
                    <AvatarFallback className="text-[8px]">
                      {(e.nome || '?').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[8rem] truncate">{e.nome || 'Novo'}</span>
                  <span className="text-muted-foreground">· {e.tipo}</span>
                </Badge>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 gap-1 px-2 text-[11px]"
                onClick={adicionarEnvolvido}
              >
                <UserPlus className="size-3 opacity-90" aria-hidden />
                Pessoa
              </Button>
            </div>
            {envolvidos.length === 0 ? (
              <p className="text-muted-foreground text-[11px] leading-snug">Nenhuma pessoa citada.</p>
            ) : (
              <div className="space-y-1.5">
                {envolvidos.map((e) => (
                  <div key={e.id} className="border-border/50 grid grid-cols-1 gap-1.5 rounded-md border p-1.5 sm:grid-cols-2">
                    <Input
                      placeholder="Nome"
                      value={e.nome}
                      onChange={(ev) => {
                        const v = ev.target.value
                        setEnvolvidos((list) => list.map((x) => (x.id === e.id ? { ...x, nome: v } : x)))
                      }}
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder="Cargo"
                      value={e.cargo}
                      onChange={(ev) => {
                        const v = ev.target.value
                        setEnvolvidos((list) => list.map((x) => (x.id === e.id ? { ...x, cargo: v } : x)))
                      }}
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder="Área"
                      value={e.area}
                      onChange={(ev) => {
                        const v = ev.target.value
                        setEnvolvidos((list) => list.map((x) => (x.id === e.id ? { ...x, area: v } : x)))
                      }}
                      className="h-8 text-xs sm:col-span-2"
                    />
                    <div className="flex gap-1 sm:col-span-2">
                      <Select
                        value={e.tipo}
                        onValueChange={(v) =>
                          setEnvolvidos((list) =>
                            list.map((x) => (x.id === e.id ? { ...x, tipo: v as Envolvido['tipo'] } : x)),
                          )
                        }
                      >
                        <SelectTrigger className="h-8 flex-1 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="denunciado">Denunciado</SelectItem>
                          <SelectItem value="testemunha">Testemunha</SelectItem>
                          <SelectItem value="vitima">Vítima</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive h-8 shrink-0 px-2"
                        onClick={() => setEnvolvidos((list) => list.filter((x) => x.id !== e.id))}
                        aria-label={`Remover ${e.nome || 'pessoa'}`}
                      >
                        <X className="size-3.5" aria-hidden />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-1">
              <Label
                htmlFor="rececao-util-interno-mock"
                className="flex items-center gap-1.5 text-[11px]"
              >
                <UserRound className="text-muted-foreground size-3 shrink-0" aria-hidden />
                Utilizador interno (mock)
              </Label>
              <Select value={utilizadorInternoMock} onValueChange={setUtilizadorInternoMock}>
                <SelectTrigger id="rececao-util-interno-mock" className="h-8 w-full text-xs">
                  <SelectValue placeholder="Selecionar utilizador interno" />
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
          </InvestigacaoWorkspaceSecao>

          <InvestigacaoWorkspaceSecao
            variant="formulario"
            density="compact"
            titulo="Duplicidade"
            subtitulo="Sugestões mock — validar antes de vincular."
            tituloIcon={<GitCompare className="size-[1rem] sm:size-[1.05rem]" strokeWidth={2} aria-hidden />}
          >
            <ul className="space-y-1">
              {MOCK_SIMILARES.map((s) => (
                <li
                  key={s.protocolo}
                  className="border-border/50 flex flex-wrap items-center justify-between gap-1 rounded-md border px-1.5 py-1"
                >
                  <div className="flex min-w-0 items-start gap-1.5">
                    <FileSearch className="text-muted-foreground mt-0.5 size-3.5 shrink-0 opacity-85" aria-hidden />
                    <div className="min-w-0">
                      <p className="text-xs font-medium">{s.protocolo}</p>
                      <p className="text-muted-foreground text-[10px] leading-tight">{s.motivo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="h-5 px-1.5 tabular-nums text-[10px]">
                      {(s.score * 100).toFixed(0)}%
                    </Badge>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 gap-1 px-1.5 text-[10px]"
                      onClick={() => toast.message('Vínculo (mock)', { description: s.protocolo })}
                    >
                      <Link2 className="size-3 shrink-0" aria-hidden />
                      Vincular
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-6 gap-1 px-2 text-[10px]"
              onClick={() => toast.message('Pesquisa de duplicados (mock)')}
            >
              <GitCompare className="size-3 shrink-0" aria-hidden />
              Buscar similares
            </Button>
          </InvestigacaoWorkspaceSecao>
        </>
      }
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
                    <Button type="button" size="sm" className="h-8 flex-1 text-xs font-medium" onClick={aplicarSugestaoClassificacao}>
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
