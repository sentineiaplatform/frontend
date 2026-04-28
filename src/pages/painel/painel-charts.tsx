'use client'

import { useId } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Funnel,
  FunnelChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  Scatter,
  ScatterChart,
  Tooltip as RechartsTooltip,
  Treemap,
  XAxis,
  YAxis,
} from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

import {
  barrasDepartamento,
  barrasEmpilhadas,
  barrasHorizontal,
  funnelEtapas,
  pizzaStatus,
  radarPerf,
  radialEtapa,
  scatterRisco,
  serieTemporal,
  treemapFolhas,
} from '@/pages/painel/chart-samples-data'

const palette = {
  mint: 'oklch(0.56 0.14 163)',
  lagoon: 'oklch(0.52 0.12 238)',
  sunset: 'oklch(0.72 0.14 62)',
  grape: 'oklch(0.58 0.16 295)',
  sky: 'oklch(0.72 0.13 215)',
  blush: 'oklch(0.72 0.12 340)',
}

const FUNNEL_PALETTE = [palette.mint, palette.lagoon, palette.sky, palette.sunset]

const PI_SLICE_COLORS = [palette.mint, palette.lagoon, palette.sky, palette.sunset]

const treemapCells = ['#059669aa', palette.lagoon, palette.sunset, palette.grape, palette.sky, palette.blush]

const scatterByZona: Record<string, string> = {
  Alto: palette.sunset,
  Médio: palette.sky,
  Baixo: palette.mint,
}

const serieConfig = {
  recebidas: { label: 'Recebidas', color: palette.mint },
  resolvidas: { label: 'Resolvidas', color: palette.lagoon },
  sla: { label: 'SLA %', color: palette.sunset },
} satisfies ChartConfig

const empilhadaConfig = {
  abertos: { label: 'Abertos', color: palette.sky },
  emAnalise: { label: 'Em análise', color: palette.sunset },
  fechados: { label: 'Fechados', color: palette.mint },
} satisfies ChartConfig

const pizzaConfig = {
  value: { label: 'Casos', color: palette.mint },
} satisfies ChartConfig

/** Grid de todos os exemplos Recharts disponíveis no ecossistema padrão. */
export function PainelChartsShowcase() {
  const gid = useId().replaceAll(':', '')
  const areaGradId = `areaGrad-${gid}`

  return (
    <section className="space-y-4">
      <div className="grid gap-3 lg:gap-4 lg:grid-cols-2 xl:grid-cols-12 xl:gap-4">
        {/* Linha */}
        <div className="border-border bg-card flex flex-col overflow-hidden rounded-xl border ring-1 ring-black/5 dark:ring-white/10 lg:col-span-2 xl:col-span-6">
          <ChartHeader titulo="Linha" texto="Volume ao longo do tempo." />
          <div className="w-full shrink-0 px-3 pb-3 pt-0.5 sm:px-4 sm:pb-3.5">
          <ChartContainer config={serieConfig} className="h-[260px] w-full shrink-0 xl:h-[280px]">
            <LineChart data={serieTemporal} margin={{ top: 12, left: 4, right: 8 }}>
              <CartesianGrid strokeDasharray="4 8" vertical={false} />
              <XAxis dataKey="mes" tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis tickLine={false} axisLine={false} width={32} domain={[0, 'auto']} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line
                dataKey="recebidas"
                type="natural"
                stroke="var(--color-recebidas)"
                strokeWidth={2.25}
                dot={{ r: 3.5 }}
                activeDot={{ r: 5 }}
              />
              <Line
                dataKey="resolvidas"
                type="natural"
                stroke="var(--color-resolvidas)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ChartContainer>
          </div>
        </div>

        {/* Área com gradiente */}
        <div className="border-border bg-card flex flex-col overflow-hidden rounded-xl border ring-1 ring-black/5 dark:ring-white/10 lg:col-span-2 xl:col-span-6">
          <ChartHeader titulo="Área" texto="Mesma série preenchida (gradiente suave)." />
          <div className="w-full shrink-0 px-3 pb-3 pt-0.5 sm:px-4 sm:pb-3.5">
          <ChartContainer config={serieConfig} className="h-[260px] w-full shrink-0 xl:h-[280px]">
            <AreaChart data={serieTemporal} margin={{ top: 12, left: 4, right: 8 }}>
              <defs>
                <linearGradient id={areaGradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={palette.mint} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={palette.lagoon} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 8" vertical={false} />
              <XAxis dataKey="mes" tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis tickLine={false} axisLine={false} width={32} domain={[0, 'auto']} />
              <ChartTooltip cursor={{ strokeDasharray: '4 8' }} content={<ChartTooltipContent />} />
              <Area
                dataKey="recebidas"
                type="monotone"
                fill={`url(#${areaGradId})`}
                stroke={palette.mint}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
          </div>
        </div>

        {/* Barras verticais */}
        <div className="border-border bg-card flex flex-col overflow-hidden rounded-xl border ring-1 ring-black/5 dark:ring-white/10 lg:col-span-1 xl:col-span-4">
          <ChartHeader titulo="Barras verticais" texto="Volumes por área fictícia." />
          <div className="w-full shrink-0 px-3 pb-3 pt-0.5 sm:px-4 sm:pb-3.5">
          <ChartContainer
            config={{ valores: { label: 'Casos', color: palette.lagoon } }}
            className="h-[260px] w-full shrink-0"
          >
            <BarChart data={barrasDepartamento} margin={{ top: 12, left: 4, right: 8 }}>
              <CartesianGrid strokeDasharray="4 8" vertical={false} />
              <XAxis dataKey="setor" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis tickLine={false} axisLine={false} width={32} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="valores" radius={[6, 6, 0, 0]} fill="var(--color-valores)" maxBarSize={48} />
            </BarChart>
          </ChartContainer>
          </div>
        </div>

        {/* Barras empilhadas */}
        <div className="border-border bg-card flex flex-col overflow-hidden rounded-xl border ring-1 ring-black/5 dark:ring-white/10 lg:col-span-1 xl:col-span-4">
          <ChartHeader titulo="Barras empilhadas" texto="Distribuição por estado em cada mês." />
          <div className="w-full shrink-0 px-3 pb-3 pt-0.5 sm:px-4 sm:pb-3.5">
          <ChartContainer config={empilhadaConfig} className="h-[260px] w-full shrink-0">
            <BarChart data={barrasEmpilhadas} margin={{ top: 12, left: 4, right: 8 }}>
              <CartesianGrid strokeDasharray="4 8" vertical={false} />
              <XAxis dataKey="mes" tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis tickLine={false} axisLine={false} width={32} />
              <ChartTooltip content={<ChartTooltipContent />} cursor={{ fillOpacity: 0.08 }} />
              <Bar dataKey="abertos" stackId="s" radius={[0, 0, 0, 0]} fill="var(--color-abertos)" maxBarSize={28} />
              <Bar dataKey="emAnalise" stackId="s" radius={[0, 0, 0, 0]} fill="var(--color-emAnalise)" maxBarSize={28} />
              <Bar
                dataKey="fechados"
                stackId="s"
                radius={[8, 8, 0, 0]}
                fill="var(--color-fechados)"
                maxBarSize={28}
              />
            </BarChart>
          </ChartContainer>
          </div>
        </div>

        {/* Barras horizontais */}
        <div className="border-border bg-card flex flex-col overflow-hidden rounded-xl border ring-1 ring-black/5 dark:ring-white/10 lg:col-span-1 xl:col-span-4">
          <ChartHeader titulo="Barras horizontais" texto='Layout "funil interno".' />
          <div className="w-full shrink-0 px-3 pb-3 pt-0.5 sm:px-4 sm:pb-3.5">
          <ChartContainer
            config={{ qtd: { label: 'Casos', color: palette.sky } }}
            className="h-[260px] w-full shrink-0"
          >
            <BarChart
              data={barrasHorizontal}
              layout="vertical"
              margin={{ left: 8, top: 8, right: 12, bottom: 8 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="4 8" />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="etapa"
                width={104}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="qtd" radius={[0, 6, 6, 0]} fill="var(--color-qtd)" />
            </BarChart>
          </ChartContainer>
          </div>
        </div>

        {/* Composto */}
        <div className="border-border bg-card flex flex-col overflow-hidden rounded-xl border ring-1 ring-black/5 dark:ring-white/10 lg:col-span-2 xl:col-span-6">
          <ChartHeader titulo="Composto (barra + linha)" texto="Volume e SLA no mesmo período." />
          <div className="w-full shrink-0 px-3 pb-3 pt-0.5 sm:px-4 sm:pb-3.5">
          <ChartContainer config={serieConfig} className="h-[280px] w-full shrink-0 xl:h-[300px]">
            <ComposedChart data={serieTemporal} margin={{ top: 12, left: 4, right: 8 }}>
              <CartesianGrid strokeDasharray="4 8" vertical={false} />
              <XAxis dataKey="mes" tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tickLine={false} axisLine={false} width={36} domain={[0, 'auto']} />
              <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} width={36} domain={[60, 100]} />
              <ChartTooltip content={<ChartTooltipContent />} cursor={{ opacity: 0.12 }} />
              <Bar yAxisId="left" dataKey="recebidas" fill={palette.mint} fillOpacity={0.82} radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Line yAxisId="right" type="natural" dataKey="sla" stroke="var(--color-sla)" strokeWidth={2.75} dot={{ r: 3 }} />
            </ComposedChart>
          </ChartContainer>
          </div>
        </div>

        {/* Pizza */}
        <div className="border-border bg-card flex flex-col overflow-hidden rounded-xl border ring-1 ring-black/5 dark:ring-white/10 lg:col-span-2 xl:col-span-6">
          <ChartHeader titulo="Pizza / rosca" texto="Distribuição por estado." />
          <div className="w-full shrink-0 px-3 pb-3 pt-0.5 sm:px-4 sm:pb-3.5">
          <ChartContainer config={pizzaConfig} className="h-[320px] w-full shrink-0 xl:h-[340px]">
            <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="name" />} />
              <Pie
                paddingAngle={2.8}
                data={pizzaStatus}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={94}
                dataKey="value"
                stroke="oklch(0.99 0.002 264 / 85%)"
                strokeWidth={1.25}
              >
                {pizzaStatus.map((_, i) => (
                  <Cell key={pizzaStatus[i]?.name ?? i} fill={PI_SLICE_COLORS[i % PI_SLICE_COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={32} formatter={String} />
            </PieChart>
          </ChartContainer>
          </div>
        </div>

        {/* Radar */}
        <div className="border-border bg-card flex flex-col overflow-hidden rounded-xl border ring-1 ring-black/5 dark:ring-white/10 lg:col-span-2 xl:col-span-6">
          <ChartHeader titulo="Radar" texto='Dimensões de maturidade (ex.: "painel institucional").' />
          <div className="w-full shrink-0 px-3 pb-3 pt-0.5 sm:px-4 sm:pb-3.5">
          <ChartContainer
            config={{ a: { label: 'Pontuação', color: palette.mint } }}
            className="h-[320px] w-full shrink-0 xl:h-[340px]"
          >
            <RadarChart cx="50%" cy="50%" outerRadius="74%" data={radarPerf}>
              <PolarGrid radialLines stroke="oklch(0.6 0.02 264 / 18%)" strokeDasharray="4 10" />
              <PolarAngleAxis dataKey="dim" tickLine={false} tick={{ fill: 'currentColor', opacity: 0.65 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ opacity: 0.45 }} tickCount={4} axisLine={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Radar
                dataKey="a"
                stroke="var(--color-a)"
                fill="var(--color-a)"
                fillOpacity={0.35}
                strokeWidth={1.75}
              />
            </RadarChart>
          </ChartContainer>
          </div>
        </div>

        {/* Radial bar */}
        <div className="border-border bg-card flex flex-col overflow-hidden rounded-xl border ring-1 ring-black/5 dark:ring-white/10 lg:col-span-2 xl:col-span-6">
          <ChartHeader titulo="Radial (metas)" texto='Anéis de progresso (valores exemplo 0–100).' />
          <div className="w-full shrink-0 px-3 pb-3 pt-0.5 sm:px-4 sm:pb-3.5">
          <ChartContainer
            config={{
              radial: { label: 'Índices', color: palette.sunset },
            }}
            className="h-[320px] w-full shrink-0 xl:h-[340px]"
          >
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius={32}
              outerRadius={132}
              data={radialEtapa}
              startAngle={100}
              endAngle={-260}
              barCategoryGap={6}
              margin={{ top: 8, bottom: 8 }}
            >
              <RechartsTooltip content={<RadialTooltip />} />
              <RadialBar cornerRadius={5} fill="#8884d8" dataKey="value" stroke="oklch(0.99 0 0 / 25%)" strokeWidth={1}>
                {radialEtapa.map((entry, idx) => (
                  <Cell key={entry.name} fill={radialEtapa[idx]?.fill ?? palette.mint} />
                ))}
              </RadialBar>
              <Legend
                formatter={(value) => <span className="text-muted-foreground text-[11px]">{String(value)}</span>}
              />
            </RadialBarChart>
          </ChartContainer>
          </div>
        </div>

        {/* Dispersão */}
        <div className="border-border bg-card flex flex-col overflow-hidden rounded-xl border ring-1 ring-black/5 dark:ring-white/10 lg:col-span-2 xl:col-span-6">
          <ChartHeader titulo="Dispersão" texto="Impacto × probabilidade (risk matrix)." />
          <div className="w-full shrink-0 px-3 pb-3 pt-0.5 sm:px-4 sm:pb-3.5">
          <ChartContainer
            config={{ impacto: { label: 'Impacto %', color: palette.grape }, probabilidade: { label: 'Prob.', color: palette.sunset } }}
            className="h-[320px] w-full shrink-0 xl:h-[340px]"
          >
            <ScatterChart margin={{ top: 14, left: 8, right: 16, bottom: 14 }}>
              <CartesianGrid strokeDasharray="4 8" />
              <XAxis type="number" dataKey="impacto" name="Impacto" unit=" %" tickLine={false} axisLine={false} domain={[0, 100]} />
              <YAxis type="number" dataKey="probabilidade" name="Prob." unit=" %" tickLine={false} axisLine={false} domain={[0, 'auto']} />
              <ChartTooltip cursor={{ strokeDasharray: '4 8' }} content={<ScatterTooltip />} />
              <Scatter name="Incidentes" data={scatterRisco}>
                {scatterRisco.map((row, i) => (
                  <Cell key={i} fill={scatterByZona[row.zona] ?? palette.sky} opacity={0.92} />
                ))}
              </Scatter>
            </ScatterChart>
          </ChartContainer>
          </div>
        </div>

        {/* Treemap */}
        <div className="border-border bg-card flex flex-col overflow-hidden rounded-xl border ring-1 ring-black/5 dark:ring-white/10 lg:col-span-2 xl:col-span-6">
          <ChartHeader titulo="Treemap" texto="Proporção por canal de entrada." />
          <div className="w-full shrink-0 px-3 pb-3 pt-0.5 sm:px-4 sm:pb-3.5">
          <ChartContainer
            config={{ size: { label: 'Casos', color: palette.lagoon } }}
            className="h-[320px] w-full shrink-0 xl:h-[340px]"
          >
            <Treemap
              data={treemapFolhas}
              dataKey="size"
              nameKey="name"
              aspectRatio={16 / 9}
              stroke="oklch(0.995 0.002 264 / 92%)"
            >
              {treemapFolhas.map((_, i) => (
                <Cell key={treemapFolhas[i]?.name ?? i} fill={treemapCells[i % treemapCells.length]} />
              ))}
            </Treemap>
          </ChartContainer>
          </div>
        </div>

        {/* Funil */}
        <div className="border-border bg-card flex flex-col overflow-hidden rounded-xl border ring-1 ring-black/5 dark:ring-white/10 lg:col-span-2 xl:col-span-full">
          <ChartHeader titulo="Funil" texto="Fluxo exemplo de tratamento até encerramento." />
          <div className="w-full shrink-0 px-3 pb-3 pt-0.5 sm:px-4 sm:pb-3.5">
          <ChartContainer
            config={{ value: { label: 'Casos', color: palette.sky } }}
            className="h-[240px] w-full shrink-0 md:h-[260px]"
          >
            <FunnelChart margin={{ top: 20, bottom: 20, left: 32, right: 32 }}>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Funnel dataKey="value" data={funnelEtapas} nameKey="name" isAnimationActive>
                {funnelEtapas.map((_, i) => (
                  <Cell key={funnelEtapas[i]?.name ?? i} fill={FUNNEL_PALETTE[i % FUNNEL_PALETTE.length]} stroke="transparent" strokeWidth={3} />
                ))}
              </Funnel>
            </FunnelChart>
          </ChartContainer>
          </div>
        </div>
      </div>
    </section>
  )
}

function ChartHeader({ titulo, texto }: Readonly<{ titulo: string; texto: string }>) {
  return (
    <div className="border-border shrink-0 space-y-0.5 border-b px-3 pb-2.5 pt-3 sm:px-4">
      <h3 className="text-card-foreground font-heading text-sm font-semibold tracking-tight">{titulo}</h3>
      <p className="text-muted-foreground text-[12px] leading-snug">{texto}</p>
    </div>
  )
}

function RadialTooltip({ active, payload }: Readonly<{ active?: boolean; payload?: unknown[] }>) {
  if (!active || !payload?.[0]) return null
  const p = payload[0] as { payload?: { name?: string; value?: number; fill?: string } }
  const row = p.payload
  if (!row) return null
  return (
    <div className="border-border rounded-lg border bg-background/95 px-2.5 py-1.5 text-xs shadow-md backdrop-blur">
      <span className="font-medium">{row.name}</span>: <span className="tabular-nums">{row.value}</span>
    </div>
  )
}

function ScatterTooltip({ active, payload }: Readonly<{ active?: boolean; payload?: unknown[] }>) {
  if (!active || !payload?.[0]) return null
  const p = payload[0] as { payload?: { impacto?: number; probabilidade?: number; zona?: string } }
  const d = p.payload
  if (!d) return null
  return (
    <div className="border-border grid gap-1 rounded-lg border bg-background/95 px-3 py-2 text-xs shadow-md backdrop-blur">
      <span className="font-medium">Impacto {d.impacto}% · Prob. {d.probabilidade}%</span>
      <span className="text-muted-foreground">{d.zona} risco</span>
    </div>
  )
}
