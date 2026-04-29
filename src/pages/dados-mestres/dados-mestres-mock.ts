export type StatusDenunciaMock = {
  id: string
  codigo: string
  nome: string
  descricao: string
  ativo: boolean
  ordem: number
  atualizadoEm: string
}

export type CategoriaDenunciaMock = {
  id: string
  codigo: string
  nome: string
  descricao: string
  slaDias: number
  ativo: boolean
  atualizadoEm: string
}

export const STATUS_DENUNCIAS_MOCK: StatusDenunciaMock[] = [
  {
    id: 's1',
    codigo: 'AB',
    nome: 'Aberta',
    descricao: 'Registro recebido e aguardando triagem.',
    ativo: true,
    ordem: 1,
    atualizadoEm: '2026-04-28T14:22:00',
  },
  {
    id: 's2',
    codigo: 'AN',
    nome: 'Em análise',
    descricao: 'Em tratamento por equipe responsável.',
    ativo: true,
    ordem: 2,
    atualizadoEm: '2026-04-27T09:15:00',
  },
  {
    id: 's3',
    codigo: 'EC',
    nome: 'Encerrada',
    descricao: 'Processo finalizado com registro de conclusão.',
    ativo: true,
    ordem: 3,
    atualizadoEm: '2026-04-25T18:40:00',
  },
  {
    id: 's4',
    codigo: 'AR',
    nome: 'Arquivada',
    descricao: 'Arquivamento administrativo sem conclusão formal.',
    ativo: false,
    ordem: 4,
    atualizadoEm: '2026-03-10T11:00:00',
  },
  {
    id: 's5',
    codigo: 'SU',
    nome: 'Suspensa',
    descricao: 'Fluxo pausado por determinação judicial ou auditoria.',
    ativo: true,
    ordem: 5,
    atualizadoEm: '2026-04-20T08:30:00',
  },
]

export const CATEGORIA_DENUNCIAS_MOCK: CategoriaDenunciaMock[] = [
  {
    id: 'c1',
    codigo: 'COR',
    nome: 'Corrupção',
    descricao: 'Desvio de recursos ou conduta potencialmente ilícita.',
    slaDias: 30,
    ativo: true,
    atualizadoEm: '2026-04-28T10:00:00',
  },
  {
    id: 'c2',
    codigo: 'ASS',
    nome: 'Assédio',
    descricao: 'Moral, sexual ou discriminação no ambiente de trabalho.',
    slaDias: 15,
    ativo: true,
    atualizadoEm: '2026-04-26T16:45:00',
  },
  {
    id: 'c3',
    codigo: 'CON',
    nome: 'Conflito de interesses',
    descricao: 'Situações que possam afetar imparcialidade.',
    slaDias: 20,
    ativo: true,
    atualizadoEm: '2026-04-22T09:20:00',
  },
  {
    id: 'c4',
    codigo: 'LGPD',
    nome: 'Privacidade / LGPD',
    descricao: 'Tratamento indevido de dados pessoais.',
    slaDias: 10,
    ativo: true,
    atualizadoEm: '2026-04-19T13:10:00',
  },
  {
    id: 'c5',
    codigo: 'LEG',
    nome: 'Legado',
    descricao: 'Categoria descontinuada — manter apenas histórico.',
    slaDias: 0,
    ativo: false,
    atualizadoEm: '2025-12-01T12:00:00',
  },
]
