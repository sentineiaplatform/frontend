/** Entrada normalizada para a lista de auditoria (origem: apenas API). */
export type ConfigAuditLogEntry = {
  id: string
  at: string
  category:
    | 'geral'
    | 'perfil'
    | 'seguranca'
    | 'membros'
    | 'perfis'
    | 'permissoes'
    | 'integracao'
    | 'notificacoes'
    | 'auth'
  action: string
  detail?: string
  actorEmail?: string
  /** Sempre `api` quando vindo de `GET /api/audit/logs`. */
  source?: 'api'
}
