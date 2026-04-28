'use client'

import type { ComponentType } from 'react'
import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight, CalendarDays, FileWarning, ShieldCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  type PainelPeriodoFiltro,
  PAINEL_PERIODO_OPCOES,
} from '@/lib/painel-periodo'
import { PainelChartsShowcase } from '@/pages/painel/painel-charts'

/**
 * Vista principal /app/painel — KPIs/gráficos exemplo. Filtro: use `painelIntervaloDoFiltro` em `@/lib/painel-periodo` quando ligar API.
 */
export function DashboardHomePage() {
  const [periodo, setPeriodo] = useState<PainelPeriodoFiltro>('ultimo_mes')

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <header className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <h1 className="text-foreground font-heading text-balance text-2xl font-semibold tracking-tight md:text-3xl">
          Painel institucional
        </h1>
        <Select value={periodo} onValueChange={(v) => setPeriodo(v as PainelPeriodoFiltro)}>
          <SelectTrigger
            size="sm"
            aria-label="Período"
            className={cn(
              'h-9 w-fit min-w-[10rem] max-w-[min(90vw,15rem)] gap-2 rounded-full border border-transparent',
              'bg-muted/45 px-3 py-1.5 pr-2.5 text-[11.5px] font-medium tracking-tight text-foreground/90 backdrop-blur-sm',
              'shadow-none hover:border-border/20 hover:bg-muted/70 dark:bg-muted/30 dark:hover:bg-muted/50',
              'focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20',
              'sm:ml-auto',
              '[&>svg:last-child]:mt-px [&>svg:last-child]:size-[13px] [&>svg:last-child]:opacity-45',
            )}
          >
            <CalendarDays className="text-muted-foreground size-3.5 shrink-0 opacity-65" aria-hidden strokeWidth={1.75} />
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            align="end"
            sideOffset={8}
            className="max-h-none min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-border/50 bg-popover/95 p-1 shadow-lg shadow-black/[0.05] backdrop-blur-md dark:border-white/[0.08] dark:bg-popover dark:shadow-black/35"
          >
            {PAINEL_PERIODO_OPCOES.map((op) => (
              <SelectItem
                key={op.value}
                value={op.value}
                className="my-0.5 cursor-pointer rounded-xl py-2 pl-8 pr-2.5 text-[12px] font-medium outline-none transition-colors focus:bg-muted/65 data-highlighted:bg-muted/55 dark:focus:bg-muted/30"
              >
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <section className="grid gap-2 sm:gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          titulo="Casos abertos"
          valor="412"
          delta="+12,4%"
          positivo
          icone={FileWarning}
          legenda="vs. mês anterior"
        />
        <KpiCard
          titulo="SLA médio"
          valor="87%"
          delta="+3,1pp"
          positivo
          icone={ShieldCheck}
          legenda="meta mínima 80%"
        />
        <KpiCard
          titulo="Tempo médio"
          valor="4,2 d"
          delta="-0,6 d"
          positivo
          icone={ArrowDownRight}
          legenda="menor é melhor"
        />
        <KpiCard
          titulo="Backlog"
          valor="128"
          delta="+5,2%"
          positivo={false}
          icone={ArrowUpRight}
          legenda="reaberturas incluídas"
        />
      </section>

      <PainelChartsShowcase />
    </div>
  )
}

function KpiCard({
  titulo,
  valor,
  delta,
  positivo,
  legenda,
  icone: Icon,
}: Readonly<{
  titulo: string
  valor: string
  delta: string
  positivo: boolean
  legenda: string
  icone: ComponentType<{ className?: string; strokeWidth?: number }>
}>) {
  return (
    <div className="border-border bg-card flex flex-col gap-1.5 rounded-xl border px-3.5 py-3 ring-1 ring-black/5 dark:ring-white/10">
      <div className="flex items-start justify-between gap-2">
        <span className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">{titulo}</span>
        <Icon className="text-muted-foreground size-4 shrink-0 opacity-70" strokeWidth={1.75} aria-hidden />
      </div>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-foreground font-heading text-2xl font-semibold tabular-nums tracking-tight">{valor}</span>
        <Badge
          variant="secondary"
          className={
            positivo ? 'border-primary/35 bg-primary/12 text-primary' : 'border-destructive/25 bg-destructive/10 text-destructive'
          }
        >
          {delta}
        </Badge>
      </div>
      <p className="text-muted-foreground text-[11px] leading-snug">{legenda}</p>
    </div>
  )
}
