/** Dados fictícios para demonstração dos gráficos do painel. */

export const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'] as const

export const serieTemporal = months.map((m, i) => ({
  mes: m,
  recebidas: 48 + i * 6 + (i % 3) * 4,
  resolvidas: 32 + i * 5 + (i % 2) * 3,
  sla: Math.min(99, 76 + i * 3 + i % 4),
}))

export const barrasDepartamento = [
  { setor: 'RH', valores: 42 },
  { setor: 'TI', valores: 28 },
  { setor: 'Jur.', valores: 35 },
  { setor: 'Ops', valores: 51 },
]

export const barrasEmpilhadas = months.slice(0, 4).map((m, i) => ({
  mes: m,
  abertos: 20 + i * 3,
  emAnalise: 15 + i * 2,
  fechados: 25 + i * 4,
}))

export const barrasHorizontal = [
  { etapa: 'Triagem', qtd: 140 },
  { etapa: 'Investigação', qtd: 96 },
  { etapa: 'Resposta', qtd: 72 },
  { etapa: 'Arquivo', qtd: 58 },
]

export const pizzaStatus = [
  { name: 'Em análise', value: 38 },
  { name: 'Resolvidas', value: 32 },
  { name: 'Pendentes', value: 21 },
  { name: 'Reabertas', value: 9 },
]

/** Folhas diretas para treemap simplificado (um nível). */
export const treemapFolhas = [
  { name: 'Portal corp.', size: 120 },
  { name: 'Linha ética', size: 88 },
  { name: 'App móvel', size: 95 },
  { name: 'E-mail', size: 52 },
  { name: 'Presencial', size: 34 },
  { name: 'Parceiros', size: 41 },
]

/** Hierarquia opcional (documentação). Raiz igual à soma das folhas. */
export const treemapRaiz = {
  name: 'Origens',
  children: [
    { name: 'Portal corp.', size: 120 },
    { name: 'Linha ética', size: 88 },
    { name: 'App móvel', size: 95 },
    { name: 'E-mail', size: 52 },
    { name: 'Presencial', size: 34 },
    { name: 'Parceiros', size: 41 },
  ],
}

export const radarPerf = [
  { dim: 'Transparência', a: 88, full: 100 },
  { dim: 'Velocidade', a: 76, full: 100 },
  { dim: 'SLA', a: 92, full: 100 },
  { dim: 'Feedback', a: 71, full: 100 },
  { dim: 'Compliance', a: 85, full: 100 },
  { dim: 'Satisfação', a: 79, full: 100 },
]

export const radialEtapa = [
  { name: 'SLA médio', value: 87, fill: 'oklch(0.58 0.15 163)' },
  { name: 'Meta período', value: 64, fill: 'oklch(0.62 0.14 280)' },
  { name: 'Encerramentos', value: 43, fill: 'oklch(0.68 0.16 45)' },
]

export const scatterRisco = [
  { impacto: 32, probabilidade: 18, zona: 'Baixo' },
  { impacto: 55, probabilidade: 42, zona: 'Médio' },
  { impacto: 71, probabilidade: 28, zona: 'Alto' },
  { impacto: 44, probabilidade: 65, zona: 'Médio' },
  { impacto: 28, probabilidade: 52, zona: 'Baixo' },
  { impacto: 63, probabilidade: 48, zona: 'Médio' },
  { impacto: 80, probabilidade: 72, zona: 'Alto' },
]

export const funnelEtapas = [
  { name: 'Denúncias', value: 1200 },
  { name: 'Validadas', value: 890 },
  { name: 'Em curso', value: 412 },
  { name: 'Encerradas', value: 256 },
]
