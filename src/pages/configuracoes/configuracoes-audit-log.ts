import { z } from 'zod'

export const CONFIG_AUDIT_LOG_STORAGE_KEY = 'sentineia:configAuditLog'

const MAX_ENTRIES = 200

const entrySchema = z.object({
  id: z.string(),
  at: z.string(),
  category: z.enum([
    'geral',
    'perfil',
    'seguranca',
    'membros',
    'perfis',
    'permissoes',
    'integracao',
    'notificacoes',
    'relatorios',
  ]),
  action: z.string(),
  detail: z.string().optional(),
})

export type ConfigAuditLogEntry = z.infer<typeof entrySchema>

const storedSchema = z.array(entrySchema)

function newId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  }
}

function readRaw(): ConfigAuditLogEntry[] {
  try {
    const raw = localStorage.getItem(CONFIG_AUDIT_LOG_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    const ok = storedSchema.safeParse(parsed)
    return ok.success ? ok.data : []
  } catch {
    return []
  }
}

function writeAll(entries: ConfigAuditLogEntry[]) {
  localStorage.setItem(CONFIG_AUDIT_LOG_STORAGE_KEY, JSON.stringify(entries))
}

/** Eventos de configuração salvos neste navegador (pré-API). */
export function readConfigAuditLog(): ConfigAuditLogEntry[] {
  return readRaw().sort((a, b) => b.at.localeCompare(a.at))
}

export function appendConfigAuditLog(
  partial: Omit<ConfigAuditLogEntry, 'id' | 'at'>,
): ConfigAuditLogEntry | null {
  try {
    const next: ConfigAuditLogEntry = {
      id: newId(),
      at: new Date().toISOString(),
      ...partial,
    }
    const merged = [next, ...readRaw()].slice(0, MAX_ENTRIES)
    writeAll(merged)
    return next
  } catch {
    return null
  }
}

export function clearConfigAuditLog(): boolean {
  try {
    localStorage.removeItem(CONFIG_AUDIT_LOG_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}
