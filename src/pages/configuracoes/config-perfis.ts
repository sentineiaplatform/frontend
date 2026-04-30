import { z } from 'zod'

export const PERFIS_STORAGE_KEY = 'sentineia:configPerfis'

const perfilSchema = z.object({
  id: z.string(),
  nome: z.string(),
  descricao: z.string(),
  sistema: z.boolean(),
})

export type ConfigPerfil = z.infer<typeof perfilSchema>

const listSchema = z.array(perfilSchema)

const SEED: ConfigPerfil[] = [
  {
    id: 'admin',
    nome: 'Administrador',
    descricao: 'Acesso total à organização e à matriz de permissões.',
    sistema: true,
  },
  {
    id: 'triador',
    nome: 'Triador',
    descricao: 'Triagem de denúncias, fila operacional e relatórios operacionais.',
    sistema: true,
  },
  {
    id: 'investigador',
    nome: 'Investigador',
    descricao: 'Tratamento de casos atribuídos e registo de atos.',
    sistema: true,
  },
  {
    id: 'leitura',
    nome: 'Leitura',
    descricao: 'Consulta de denúncias e relatórios permitidos, sem edição.',
    sistema: true,
  },
]

function newId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `pf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  }
}

export function readPerfisRaw(): ConfigPerfil[] {
  try {
    const raw = localStorage.getItem(PERFIS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    const ok = listSchema.safeParse(parsed)
    return ok.success ? ok.data : []
  } catch {
    return []
  }
}

export function writePerfis(list: ConfigPerfil[]): void {
  localStorage.setItem(PERFIS_STORAGE_KEY, JSON.stringify(list))
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sentineia:perfis-changed'))
  }
}

/** Garante lista não vazia com seed de sistema. */
export function ensurePerfisSeed(): ConfigPerfil[] {
  const cur = readPerfisRaw()
  if (cur.length === 0) {
    writePerfis(SEED)
    return [...SEED]
  }
  const byId = new Map(cur.map((p) => [p.id, p]))
  let next = [...cur]
  for (const s of SEED) {
    if (!byId.has(s.id)) {
      next.push(s)
      byId.set(s.id, s)
    }
  }
  if (next.length !== cur.length) writePerfis(next)
  return next
}

export function addPerfil(nome: string, descricao: string): ConfigPerfil[] {
  const list = ensurePerfisSeed()
  const p: ConfigPerfil = {
    id: newId(),
    nome: nome.trim(),
    descricao: descricao.trim(),
    sistema: false,
  }
  const next = [...list, p]
  writePerfis(next)
  return next
}

export function removePerfil(id: string): ConfigPerfil[] | null {
  const list = ensurePerfisSeed()
  const target = list.find((p) => p.id === id)
  if (!target || target.sistema) return null
  const next = list.filter((p) => p.id !== id)
  writePerfis(next)
  return next
}
