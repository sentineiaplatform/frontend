export type DenunciaStatus = 'aberta' | 'em_analise' | 'encerrada'
export type DenunciaPrioridade = 'P1' | 'P2' | 'P3'

export type DenunciaMock = {
  id: string
  protocolo: string
  registradoEm: string
  categoria: string
  status: DenunciaStatus
  canal: string
  prioridade: DenunciaPrioridade
  departamento: string
  areaDemanda: string
  tipoEntrada: string
  atualizadoEm: string
}

type DenunciaRowBase = Omit<
  DenunciaMock,
  'prioridade' | 'departamento' | 'areaDemanda' | 'tipoEntrada' | 'atualizadoEm'
>

const DENUNCIA_BASE_ROWS: DenunciaRowBase[] = [
  {
    id: '1',
    protocolo: 'DEN-2026-00412',
    registradoEm: '2026-04-26T14:22:00',
    categoria: 'Assédio moral',
    status: 'em_analise',
    canal: 'Canal web',
  },
  {
    id: '2',
    protocolo: 'DEN-2026-00411',
    registradoEm: '2026-04-25T09:10:00',
    categoria: 'Fraude / corrupção',
    status: 'aberta',
    canal: 'Telefone',
  },
  {
    id: '3',
    protocolo: 'DEN-2026-00410',
    registradoEm: '2026-04-24T16:45:00',
    categoria: 'Segurança da informação',
    status: 'encerrada',
    canal: 'Canal web',
  },
  {
    id: '4',
    protocolo: 'DEN-2026-00409',
    registradoEm: '2026-04-23T11:05:00',
    categoria: 'Conflito de interesse',
    status: 'aberta',
    canal: 'Presencial',
  },
  {
    id: '5',
    protocolo: 'DEN-2026-00408',
    registradoEm: '2026-04-22T08:30:00',
    categoria: 'Meio ambiente',
    status: 'em_analise',
    canal: 'Canal web',
  },
  {
    id: '6',
    protocolo: 'DEN-2026-00407',
    registradoEm: '2026-04-20T17:52:00',
    categoria: 'Assédio sexual',
    status: 'aberta',
    canal: 'Telefone',
  },
  {
    id: '7',
    protocolo: 'DEN-2026-00406',
    registradoEm: '2026-04-19T10:18:00',
    categoria: 'Fraude / corrupção',
    status: 'encerrada',
    canal: 'Canal web',
  },
  {
    id: '8',
    protocolo: 'DEN-2026-00405',
    registradoEm: '2026-04-18T13:40:00',
    categoria: 'Discriminação',
    status: 'em_analise',
    canal: 'Canal web',
  },
  {
    id: '9',
    protocolo: 'DEN-2026-00404',
    registradoEm: '2026-04-17T09:00:00',
    categoria: 'Segurança do trabalho',
    status: 'aberta',
    canal: 'E-mail',
  },
  {
    id: '10',
    protocolo: 'DEN-2026-00403',
    registradoEm: '2026-04-16T15:22:00',
    categoria: 'Fraude / corrupção',
    status: 'encerrada',
    canal: 'Canal web',
  },
  {
    id: '11',
    protocolo: 'DEN-2026-00402',
    registradoEm: '2026-04-14T11:55:00',
    categoria: 'Assédio moral',
    status: 'aberta',
    canal: 'Telefone',
  },
  {
    id: '12',
    protocolo: 'DEN-2026-00401',
    registradoEm: '2026-04-12T08:12:00',
    categoria: 'Concorrência desleal',
    status: 'em_analise',
    canal: 'Canal web',
  },
  {
    id: '13',
    protocolo: 'DEN-2026-00400',
    registradoEm: '2026-04-10T14:00:00',
    categoria: 'Meio ambiente',
    status: 'encerrada',
    canal: 'Presencial',
  },
  {
    id: '14',
    protocolo: 'DEN-2026-00398',
    registradoEm: '2026-04-08T10:31:00',
    categoria: 'Segurança da informação',
    status: 'aberta',
    canal: 'Canal web',
  },
  {
    id: '15',
    protocolo: 'DEN-2026-00395',
    registradoEm: '2026-04-05T16:07:00',
    categoria: 'Fraude / corrupção',
    status: 'em_analise',
    canal: 'Telefone',
  },
  {
    id: '16',
    protocolo: 'DEN-2026-00394',
    registradoEm: '2026-04-03T09:41:00',
    categoria: 'Suborno',
    status: 'aberta',
    canal: 'Canal web',
  },
  {
    id: '17',
    protocolo: 'DEN-2026-00392',
    registradoEm: '2026-04-02T13:05:00',
    categoria: 'Integridade institucional',
    status: 'encerrada',
    canal: 'E-mail',
  },
  {
    id: '18',
    protocolo: 'DEN-2026-00390',
    registradoEm: '2026-03-31T11:28:00',
    categoria: 'Conduta irregular',
    status: 'em_analise',
    canal: 'Telefone',
  },
  {
    id: '19',
    protocolo: 'DEN-2026-00388',
    registradoEm: '2026-03-29T08:52:00',
    categoria: 'Privacidade (LGPD)',
    status: 'aberta',
    canal: 'Canal web',
  },
  {
    id: '20',
    protocolo: 'DEN-2026-00387',
    registradoEm: '2026-03-27T17:39:00',
    categoria: 'Outros — denúncia anônima',
    status: 'aberta',
    canal: 'Presencial',
  },
]

const PRIORIDS: DenunciaPrioridade[] = ['P1', 'P2', 'P3']

/** Departamentos exibidos na listagem — reutilizados no formulário de nova denúncia. */
export const DENUNCIA_DEPARTAMENTOS_MOCK = [
  'Compliance & integridade',
  'Recursos humanos',
  'Tecnologia e dados',
  'Jurídico institucional',
  'Gestão de risco',
] as const

/** Áreas demandadas na listagem. */
export const DENUNCIA_AREAS_DEMANDA_MOCK = [
  'Ética e conduta corporativa',
  'Investigações internas — Nível II',
  'Canal público estadual federado',
  'Antitruste e políticas internas',
  'SLA institucional de 3ª linha',
] as const

/** Tipos de entrada (“Entrada”) na listagem. */
export const DENUNCIA_TIPOS_ENTRADA_MOCK = [
  'Portal anônimo certificado',
  'Integração webhook ouvidoria.se',
  'Import CSV — triagem inicial',
  'API parceiros — canal seguro',
  'Registro físico auditável',
] as const

/** Canais usados na listagem. */
export const DENUNCIA_CANAIS_MOCK = [
  'Canal web',
  'Telefone',
  'Presencial',
  'E-mail',
] as const

export const DENUNCIA_STATUS_FORM: { value: DenunciaStatus; label: string }[] = [
  { value: 'aberta', label: 'Aberta' },
  { value: 'em_analise', label: 'Em análise' },
  { value: 'encerrada', label: 'Encerrada' },
]

export const DENUNCIA_PRIORIDADE_FORM: { value: DenunciaPrioridade; label: string }[] = [
  { value: 'P1', label: 'P1 — urgente' },
  { value: 'P2', label: 'P2 — média' },
  { value: 'P3', label: 'P3 — rotina' },
]

function dataAtualizacaoIso(registradoIso: string, diasOffset: number) {
  const d = new Date(registradoIso)
  if (Number.isNaN(d.getTime())) return registradoIso
  d.setDate(d.getDate() + diasOffset)
  return d.toISOString().slice(0, 19)
}

/** Dados fictícios até integração com API — colunas extras para simular lista larga. */
export const DENUNCIAS_MOCK: DenunciaMock[] = DENUNCIA_BASE_ROWS.map((row, idx) => {
  const dias = idx % 5
  const prioridade = PRIORIDS[idx % PRIORIDS.length]
  return {
    ...row,
    prioridade,
    departamento: DENUNCIA_DEPARTAMENTOS_MOCK[idx % DENUNCIA_DEPARTAMENTOS_MOCK.length],
    areaDemanda: DENUNCIA_AREAS_DEMANDA_MOCK[idx % DENUNCIA_AREAS_DEMANDA_MOCK.length],
    tipoEntrada: DENUNCIA_TIPOS_ENTRADA_MOCK[idx % DENUNCIA_TIPOS_ENTRADA_MOCK.length],
    atualizadoEm: dataAtualizacaoIso(row.registradoEm, dias),
  }
})
