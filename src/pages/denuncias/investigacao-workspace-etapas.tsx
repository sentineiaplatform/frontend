import { format, isValid, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import {
  AlertTriangle,
  BadgeCheck,
  Ban,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
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
  Lock,
  Scale,
  Shield,
  Sparkles,
  Upload,
  UserCheck,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
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
  const [tab, setTab] = useState<'kanban' | 'timeline'>('kanban')
  return (
    <>
      <InvestigacaoWorkspaceSecao
        variant="formulario"
        titulo="Tarefas investigativas"
        subtitulo="Kanban mock — arrastar será ligado à API."
        tituloIcon={<Kanban className="size-[1.05rem] sm:size-[1.15rem]" strokeWidth={2} aria-hidden />}
      >
        <ToggleGroup
          type="single"
          value={tab}
          onValueChange={(v) => {
            if (v === 'kanban' || v === 'timeline') setTab(v)
          }}
          className="flex w-full justify-stretch rounded-lg bg-muted/40 p-1"
          variant="outline"
          size="sm"
          spacing={0}
          aria-label="Vista das tarefas"
        >
          <ToggleGroupItem value="kanban" className="flex-1 text-xs">
            Kanban
          </ToggleGroupItem>
          <ToggleGroupItem value="timeline" className="flex-1 text-xs">
            Timeline
          </ToggleGroupItem>
        </ToggleGroup>
        {tab === 'kanban' ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {['A fazer', 'Em curso', 'Concluído'].map((col) => (
              <div key={col} className="border-border/50 bg-muted/15 rounded-lg border p-2">
                <p className="text-muted-foreground mb-2 text-[10px] font-semibold uppercase">{col}</p>
                <div className="space-y-1.5">
                  <div className="bg-background border-border/60 rounded border px-2 py-1.5 text-[11px]">
                    Entrevista RH (mock)
                  </div>
                  {col === 'A fazer' ? (
                    <div className="bg-background border-border/60 rounded border px-2 py-1.5 text-[11px]">
                      Recolher logs de acesso
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ul className="border-border/50 space-y-2 border-l-2 border-primary/35 pl-3">
            <li className="text-xs">
              <span className="text-muted-foreground tabular-nums">D1 · </span>
              Abertura do caso
            </li>
            <li className="text-xs">
              <span className="text-muted-foreground tabular-nums">D3 · </span>
              Pedido de documentos internos (mock)
            </li>
            <li className="text-xs">
              <span className="text-muted-foreground tabular-nums">D5 · </span>
              Entrevista agendada
            </li>
          </ul>
        )}
      </InvestigacaoWorkspaceSecao>

      <InvestigacaoWorkspaceSecao
        variant="formulario"
        density="compact"
        titulo="Evidências"
        subtitulo="Upload estruturado + cadeia de custódia (mock)."
        tituloIcon={<Upload className="size-[1rem] sm:size-[1.05rem]" strokeWidth={2} aria-hidden />}
      >
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="secondary" className="h-8 gap-1 text-xs" onClick={() => toast.message('Anexar documento (mock)')}>
            Documento
          </Button>
          <Button type="button" size="sm" variant="secondary" className="h-8 gap-1 text-xs" onClick={() => toast.message('Registar print (mock)')}>
            Print / captura
          </Button>
          <Button type="button" size="sm" variant="secondary" className="h-8 gap-1 text-xs" onClick={() => toast.message('Metadados de log (mock)')}>
            Log / sistema
          </Button>
        </div>
      </InvestigacaoWorkspaceSecao>

      <InvestigacaoWorkspaceSecao
        variant="formulario"
        density="compact"
        titulo="Entrevistas"
        subtitulo="Depoimentos resumidos."
        tituloIcon={<Users className="size-[1rem] sm:size-[1.05rem]" strokeWidth={2} aria-hidden />}
      >
        <Textarea placeholder="Notas de entrevista…" className="min-h-[72px] text-xs" readOnly />
        <Button type="button" size="sm" variant="outline" className="h-8 text-xs" onClick={() => toast.message('Nova entrevista (mock)')}>
          Registar entrevista
        </Button>
      </InvestigacaoWorkspaceSecao>
    </>
  )
}

function InvestigacaoLateral() {
  return (
    <>
      <InvestigacaoWorkspaceSecao
        variant="formulario"
        density="compact"
        titulo="Responsáveis"
        subtitulo="Investigador principal e apoio."
        tituloIcon={<UserCheck className="size-[1rem] sm:size-[1.05rem]" strokeWidth={2} aria-hidden />}
      >
        <div className="space-y-2 text-xs">
          <div>
            <Label className="text-[10px] uppercase">Principal</Label>
            <Input readOnly className="mt-0.5 h-8 text-xs" value="Ana Ribeiro · Compliance" />
          </div>
          <div>
            <Label className="text-[10px] uppercase">Apoio</Label>
            <Input readOnly className="mt-0.5 h-8 text-xs" value="Equipa SI · logs" />
          </div>
        </div>
      </InvestigacaoWorkspaceSecao>
      <InvestigacaoWorkspaceSecao
        variant="formulario"
        density="compact"
        titulo="Controles"
        tituloIcon={<Lock className="size-[1rem] sm:size-[1.05rem]" strokeWidth={2} aria-hidden />}
      >
        <label className="flex cursor-pointer items-center gap-2 text-[11px]">
          <Checkbox defaultChecked />
          Caso sensível — restringir acesso
        </label>
        <p className="text-muted-foreground mt-2 text-[11px] leading-snug">
          Cadeia de custódia: cada evidência com hash e responsável (mock).
        </p>
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

function EncerramentoCentro({
  investigation,
  onInvestigationUpdated,
}: Readonly<{
  investigation?: InvestigationDto | null
  onInvestigationUpdated?: (inv: InvestigationDto) => void
}>) {
  const [dataEncerramento, setDataEncerramento] = useState('')
  const [closureJustification, setClosureJustification] = useState('')
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

  return (
    <>
      <InvestigacaoWorkspaceSecao
        variant="formulario"
        titulo="Validações finais"
        subtitulo="Garantir pré-requisitos antes do encerramento formal."
        tituloIcon={<ClipboardCheck className="size-[1.05rem] sm:size-[1.15rem]" strokeWidth={2} aria-hidden />}
      >
        <label className="flex items-center gap-2 text-[11px]">
          <Checkbox defaultChecked /> Investigação concluída
        </label>
        <label className="flex items-center gap-2 text-[11px]">
          <Checkbox defaultChecked /> Ações definidas no plano
        </label>
        <label className="flex items-center gap-2 text-[11px]">
          <Checkbox /> Notificar denunciante identificado (opcional)
        </label>
        <div className="grid gap-2 pt-2 sm:grid-cols-2">
          <div>
            <Label className="text-[11px]">Data de encerramento</Label>
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
                    className={cn(
                      'h-8 min-h-8 w-full min-w-0 flex-1 justify-start rounded-none border-0 bg-transparent px-2 py-0 text-xs font-normal shadow-none',
                      'focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0',
                      !dataEncerramentoParsed && 'text-muted-foreground',
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
          </div>
          <div>
            <Label className="text-[11px]">Responsável final</Label>
            <Input className="mt-0.5 h-8 text-xs" placeholder="Nome / papel" />
          </div>
        </div>
        <Textarea
          className="min-h-[56px] text-xs"
          placeholder="Justificativa do encerramento"
          value={closureJustification}
          onChange={(e) => setClosureJustification(e.target.value)}
        />
        <Button type="button" className="h-9 text-xs" onClick={marcarEncerrado} disabled={saving || !investigation?.id}>
          {saving ? 'A guardar...' : 'Marcar encerrado'}
        </Button>
      </InvestigacaoWorkspaceSecao>
    </>
  )
}

function EncerramentoLateral() {
  return (
    <InvestigacaoWorkspaceSecao
      variant="formulario"
      density="compact"
      titulo="Estado"
      tituloIcon={<History className="size-[1rem] sm:size-[1.05rem]" strokeWidth={2} aria-hidden />}
    >
      <p className="text-muted-foreground text-[11px] leading-snug">
        Após encerramento, alterações devem passar por fluxo de reabertura controlado (futuro).
      </p>
    </InvestigacaoWorkspaceSecao>
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

export function InvestigacaoEtapasRightColumn({ phase }: Readonly<Pick<InvestigacaoEtapasColumnsProps, 'phase'>>) {
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
      return <EncerramentoLateral />
    case 'relatorio_final':
      return <RelatorioLateral />
    case 'generico':
      return <GenericoLateral />
    default:
      return null
  }
}
