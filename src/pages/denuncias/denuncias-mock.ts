export type DenunciaStatus = 'aberta' | 'em_analise' | 'encerrada'
export type DenunciaPrioridade = 'P1' | 'P2' | 'P3'

/** Ficheiros enviados pelo denunciante no registo (mock até API). */
export type DenunciaEvidenciaMock = {
  id: string
  nome: string
  tamanho: string
  enviadoEm: string
}

export type DenunciaAnonimato = 'anonimo' | 'identificado'

/** Metadados técnicos do canal (mock; respeitar política de retenção na API real). */
export type DenunciaMetadadosEntradaMock = {
  ip?: string
  localizacaoAprox?: string
  userAgent?: string
}

export type DenunciaMock = {
  id: string
  protocolo: string
  /** Título resumido da denúncia (campo {@code title} do backend). */
  titulo: string
  registradoEm: string
  categoria: string
  status: DenunciaStatus
  canal: string
  prioridade: DenunciaPrioridade
  departamento: string
  atualizadoEm: string
  /** Evidências anexadas pelo denunciante no canal de entrada. */
  evidencias: DenunciaEvidenciaMock[]
  /** Texto integral submetido (imutável na receção). */
  relatoOriginal: string
  anonimato: DenunciaAnonimato
  metadadosEntrada: DenunciaMetadadosEntradaMock
  /** Prazo de SLA para triagem inicial, em horas após registradoEm. */
  slaTriagemHoras: number
  /** Caso inativo na fila; não confundir com status do fluxo. */
  ativa: boolean
}

type DenunciaRowBase = Omit<
  DenunciaMock,
  | 'titulo'
  | 'prioridade'
  | 'departamento'
  | 'atualizadoEm'
  | 'evidencias'
  | 'relatoOriginal'
  | 'anonimato'
  | 'metadadosEntrada'
  | 'slaTriagemHoras'
  | 'ativa'
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

function relatoOriginalMock(protocolo: string, categoria: string): string {
  return [
    `(${protocolo})`,
    '',
    'Sou colaborador há mais de dois anos na equipa de operações. Nos últimos meses tenho sido alvo de comentários humilhantes em reuniões com clientes presentes, com tom sarcástico e referências ao meu desempenho “precisando de supervisão constante”.',
    '',
    `O tema declarado no formulário foi «${categoria}». Peço que o caso seja tratado com confidencialidade — há receio de represálias por parte da chefia imediata.`,
    '',
    'Datas aproximadas: incidentes recorrentes entre fevereiro e março, maior intensidade às segundas-feiras após relatórios semanais.',
  ].join('\n')
}

function metadadosEntradaMock(idx: number): DenunciaMetadadosEntradaMock {
  const showIp = idx % 5 !== 0
  return {
    ip: showIp ? `10.${20 + (idx % 40)}.${idx % 200}.${idx % 180}` : undefined,
    localizacaoAprox: idx % 7 === 0 ? 'Indisponível (anonimizado)' : 'Grande Porto · ~12 km',
    userAgent:
      idx % 3 === 0
        ? 'Safari · iOS 18 · Web canal'
        : 'Chrome 134 · Windows 11 · Desktop',
  }
}

function evidenciasMockDenuncia(idx: number, registradoEm: string): DenunciaEvidenciaMock[] {
  const ts = registradoEm.length >= 19 ? registradoEm.slice(0, 19) : registradoEm
  if (idx % 6 === 2) return []
  const list: DenunciaEvidenciaMock[] = []
  list.push({
    id: `ev-${idx}-1`,
    nome: idx % 2 === 0 ? 'relato_e_contexto.pdf' : 'historico_mensagens_anonimo.pdf',
    tamanho: idx % 2 === 0 ? '312 KB' : '428 KB',
    enviadoEm: ts,
  })
  if (idx % 3 === 0 || idx === 0) {
    list.push({
      id: `ev-${idx}-2`,
      nome: idx === 0 ? 'print_escalas_equipa.pdf' : 'anexo_politica_interna.pdf',
      tamanho: idx === 0 ? '1,1 MB' : '220 KB',
      enviadoEm: ts,
    })
  }
  if (idx % 5 === 1) {
    list.push({
      id: `ev-${idx}-3`,
      nome: 'gravacao_chamada_entrada.m4a',
      tamanho: '4,8 MB',
      enviadoEm: ts,
    })
  }
  return list
}

/** Dados fictícios para a página de investigação (mock; a listagem usa a API). */
export const DENUNCIAS_MOCK: DenunciaMock[] = DENUNCIA_BASE_ROWS.map((row, idx) => {
  const dias = idx % 5
  const prioridade = PRIORIDS[idx % PRIORIDS.length]
  return {
    ...row,
    titulo: `${row.categoria} — denúncia ${row.protocolo}`,
    prioridade,
    departamento: DENUNCIA_DEPARTAMENTOS_MOCK[idx % DENUNCIA_DEPARTAMENTOS_MOCK.length],
    atualizadoEm: dataAtualizacaoIso(row.registradoEm, dias),
    evidencias: evidenciasMockDenuncia(idx, row.registradoEm),
    relatoOriginal: relatoOriginalMock(row.protocolo, row.categoria),
    anonimato: idx % 3 === 0 ? 'identificado' : 'anonimo',
    metadadosEntrada: metadadosEntradaMock(idx),
    slaTriagemHoras: 48,
    ativa: idx % 11 !== 3,
  }
})

export function findDenunciaByProtocolo(protocolo: string): DenunciaMock | undefined {
  const p = protocolo.trim()
  if (!p) return undefined
  return DENUNCIAS_MOCK.find((d) => d.protocolo === p)
}

/** Rota da área de trabalho (investigação) ligada ao fluxo configurado em Dados mestres → Workflows. */
export function hrefInvestigacaoDenuncia(protocolo: string): string {
  return `/app/denuncias/${encodeURIComponent(protocolo.trim())}/investigacao`
}
