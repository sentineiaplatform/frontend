/** Valores aceites pelo select de período do painel. */
export type PainelPeriodoFiltro =
  | 'ultima_semana'
  | 'ultimo_mes'
  | 'ultimo_ano'
  | 'todo'

export const PAINEL_PERIODO_OPCOES: ReadonlyArray<{
  value: PainelPeriodoFiltro
  label: string
}> = [
  { value: 'ultima_semana', label: 'Última semana' },
  { value: 'ultimo_mes', label: 'Último mês' },
  { value: 'ultimo_ano', label: 'Último ano' },
  { value: 'todo', label: 'Todo o período' },
]

function inicioDia(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function fimDia(d: Date) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

/** Intervalo `[início?, fim]` para pedidos à API. Modo período global: só `fim`; `inicio` omitido. */
export function painelIntervaloDoFiltro(
  filtro: PainelPeriodoFiltro,
  referencia: Date = new Date(),
): { inicio?: Date; fim: Date } {
  const fim = fimDia(referencia)

  if (filtro === 'todo') {
    return { fim }
  }

  switch (filtro) {
    case 'ultima_semana': {
      const inicio = inicioDia(referencia)
      inicio.setDate(inicio.getDate() - 6)
      return { inicio, fim }
    }
    case 'ultimo_mes': {
      const primeiroMesPassado = new Date(referencia.getFullYear(), referencia.getMonth() - 1, 1)
      const ultimoMesPassado = new Date(referencia.getFullYear(), referencia.getMonth(), 0)
      return {
        inicio: inicioDia(primeiroMesPassado),
        fim: fimDia(ultimoMesPassado),
      }
    }
    case 'ultimo_ano': {
      const ano = referencia.getFullYear() - 1
      return {
        inicio: inicioDia(new Date(ano, 0, 1)),
        fim: fimDia(new Date(ano, 11, 31)),
      }
    }
    default: {
      return { fim }
    }
  }
}
