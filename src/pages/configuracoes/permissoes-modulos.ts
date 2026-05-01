/** Módulos e ações da matriz de permissões (partilhado entre UI e persistência). */

export type TipoPermissao = 'create' | 'read' | 'update' | 'delete' | 'other'

export const TIPO_BADGE: Record<TipoPermissao, { short: string; title: string }> = {
  create: { short: 'C', title: 'Criar' },
  read: { short: 'R', title: 'Ler' },
  update: { short: 'U', title: 'Atualizar' },
  delete: { short: 'D', title: 'Eliminar' },
  other: { short: '±', title: 'Outra ação' },
}

export type ModuloAcao = {
  id: string
  tipo: TipoPermissao
  label: string
  hint: string
}

export type ModuloDef = {
  id: string
  label: string
  hint: string
  actions: ModuloAcao[]
}

export const MODULOS: ModuloDef[] = [
  {
    id: 'denuncias',
    label: 'Denúncias',
    hint: 'Casos, fila operacional e tratamento.',
    actions: [
      { id: 'create', tipo: 'create', label: 'Criar', hint: 'Registar denúncia manual ou importação.' },
      { id: 'read', tipo: 'read', label: 'Ler', hint: 'Lista, detalhe e histórico.' },
      { id: 'update', tipo: 'update', label: 'Atualizar', hint: 'Estado, notas, anexos e campos operacionais.' },
      { id: 'delete', tipo: 'delete', label: 'Eliminar', hint: 'Remoção definitiva (com auditoria).' },
      {
        id: 'triage',
        tipo: 'other',
        label: 'Triagem / atribuir',
        hint: 'Priorizar, mover na fila e atribuir responsável.',
      },
      { id: 'export', tipo: 'other', label: 'Exportar', hint: 'Extractos e ficheiros do caso ou lista.' },
    ],
  },
  {
    id: 'dados_mestres',
    label: 'Dados mestres',
    hint: 'Estados, categorias e tabelas de referência.',
    actions: [
      { id: 'create', tipo: 'create', label: 'Criar', hint: 'Novos registos em dados mestres.' },
      { id: 'read', tipo: 'read', label: 'Ler', hint: 'Consulta de valores e configurações.' },
      { id: 'update', tipo: 'update', label: 'Atualizar', hint: 'Editar registos existentes.' },
      { id: 'delete', tipo: 'delete', label: 'Eliminar', hint: 'Remover registos (sujeito a regras).' },
      {
        id: 'publish',
        tipo: 'other',
        label: 'Publicar alterações',
        hint: 'Tornar mudanças visíveis à operação (quando aplicável).',
      },
    ],
  },
  {
    id: 'workflows',
    label: 'Fluxos (workflows)',
    hint: 'Diagrama de estados e transições.',
    actions: [
      { id: 'create', tipo: 'create', label: 'Criar', hint: 'Novo rascunho de fluxo.' },
      { id: 'read', tipo: 'read', label: 'Ler', hint: 'Ver fluxo e validações.' },
      { id: 'update', tipo: 'update', label: 'Atualizar', hint: 'Editar nós, ligações e metadados.' },
      { id: 'delete', tipo: 'delete', label: 'Eliminar', hint: 'Remover versão ou rascunho.' },
      {
        id: 'publish',
        tipo: 'other',
        label: 'Publicar versão',
        hint: 'Ativar fluxo para novos casos.',
      },
    ],
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    hint: 'Organização, segurança e auditoria.',
    actions: [
      { id: 'read', tipo: 'read', label: 'Ler', hint: 'Ver definições da organização.' },
      { id: 'update', tipo: 'update', label: 'Atualizar', hint: 'Alterar preferências gerais e perfil org.' },
      {
        id: 'members',
        tipo: 'other',
        label: 'Gerir membros',
        hint: 'Convites, papéis na org e remoções.',
      },
      {
        id: 'permissions',
        tipo: 'other',
        label: 'Gerir permissões',
        hint: 'Matriz de módulos e ações (esta página).',
      },
      {
        id: 'audit',
        tipo: 'other',
        label: 'Ver auditoria',
        hint: 'Logs de alterações em configurações.',
      },
    ],
  },
]

/** IDs dos perfis seeded (valores por defeito na matriz). */
export const SEED_PERFIL_IDS = ['admin', 'triador', 'investigador', 'leitura'] as const
export type SeedPerfilId = (typeof SEED_PERFIL_IDS)[number]

export function cellKey(moduloId: string, actionId: string): string {
  return `${moduloId}.${actionId}`
}

export function iterKeys(): string[] {
  return MODULOS.flatMap((m) => m.actions.map((a) => cellKey(m.id, a.id)))
}

export type MatrizPermissoes = Record<string, Record<string, boolean>>

function rowSeed(
  cells: Partial<Record<SeedPerfilId, boolean>>,
): Record<SeedPerfilId, boolean> {
  return {
    admin: cells.admin ?? false,
    triador: cells.triador ?? false,
    investigador: cells.investigador ?? false,
    leitura: cells.leitura ?? false,
  }
}

/** Baseline só para os perfis seed; depois expande com `false` para outros IDs. */
function baselineSeedRows(): Record<string, Record<SeedPerfilId, boolean>> {
  const rows: Record<string, Record<SeedPerfilId, boolean>> = {}
  const set = (mod: string, act: string, v: Record<SeedPerfilId, boolean>) => {
    rows[cellKey(mod, act)] = v
  }
  set('denuncias', 'create', rowSeed({ admin: true, triador: true }))
  set('denuncias', 'read', rowSeed({ admin: true, triador: true, investigador: true, leitura: true }))
  set('denuncias', 'update', rowSeed({ admin: true, triador: true, investigador: true }))
  set('denuncias', 'delete', rowSeed({ admin: true }))
  set('denuncias', 'triage', rowSeed({ admin: true, triador: true }))
  set('denuncias', 'export', rowSeed({ admin: true, triador: true, investigador: true, leitura: true }))
  set('dados_mestres', 'create', rowSeed({ admin: true }))
  set('dados_mestres', 'read', rowSeed({ admin: true, triador: true, investigador: true, leitura: true }))
  set('dados_mestres', 'update', rowSeed({ admin: true }))
  set('dados_mestres', 'delete', rowSeed({ admin: true }))
  set('dados_mestres', 'publish', rowSeed({ admin: true }))
  set('workflows', 'create', rowSeed({ admin: true }))
  set('workflows', 'read', rowSeed({ admin: true, triador: true }))
  set('workflows', 'update', rowSeed({ admin: true }))
  set('workflows', 'delete', rowSeed({ admin: true }))
  set('workflows', 'publish', rowSeed({ admin: true }))
  set('configuracoes', 'read', rowSeed({ admin: true }))
  set('configuracoes', 'update', rowSeed({ admin: true }))
  set('configuracoes', 'members', rowSeed({ admin: true }))
  set('configuracoes', 'permissions', rowSeed({ admin: true }))
  set('configuracoes', 'audit', rowSeed({ admin: true, triador: true }))
  return rows
}

/** Matriz completa para os `profileIds` atuais (seed copiado; restantes = false). */
export function buildBaselineMatriz(profileIds: string[]): MatrizPermissoes {
  const seed = baselineSeedRows()
  const keys = iterKeys()
  const result: MatrizPermissoes = {}
  const seedSet = new Set<string>(SEED_PERFIL_IDS)

  for (const k of keys) {
    const row: Record<string, boolean> = {}
    const seedRow = seed[k]
    for (const pid of profileIds) {
      if (seedSet.has(pid) && seedRow) {
        row[pid] = seedRow[pid as SeedPerfilId] ?? false
      } else {
        row[pid] = false
      }
    }
    result[k] = row
  }
  return result
}

export function mergeSavedMatriz(
  saved: MatrizPermissoes | null,
  profileIds: string[],
  baseline: MatrizPermissoes,
): MatrizPermissoes {
  if (!saved || Object.keys(saved).length === 0) return baseline
  const keys = iterKeys()
  const out: MatrizPermissoes = {}
  for (const k of keys) {
    const row: Record<string, boolean> = { ...baseline[k] }
    for (const pid of profileIds) {
      if (saved[k] && typeof saved[k][pid] === 'boolean') {
        row[pid] = saved[k][pid]
      }
    }
    out[k] = row
  }
  return out
}

export function contarPermissoesAtivas(m: MatrizPermissoes, profileIds: string[]): number {
  let n = 0
  for (const k of iterKeys()) {
    for (const pid of profileIds) {
      if (m[k]?.[pid]) n += 1
    }
  }
  return n
}
