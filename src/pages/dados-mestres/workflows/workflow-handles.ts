/** Um ponto por lado: entrada (topo/esq.) e saída (baixo/dir.) — 4 no total por estado. */
export const WF_HANDLE = {
  /** Entrada pela esquerda */
  inL: 'in-l',
  /** Saída pela direita */
  outR: 'out-r',
  /** Entrada por cima */
  inT: 'in-t',
  /** Saída por baixo */
  outB: 'out-b',
} as const
