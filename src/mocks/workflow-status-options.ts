/**
 * Catálogo mock de status (espelho de “Status denúncias”).
 * Quando existir API, substituir por hook/useQuery mantendo { id, label, slug }.
 */
export type WorkflowStatusOption = {
  readonly id: string
  readonly label: string
  readonly slug: string
}

export const WORKFLOW_STATUS_OPTIONS: readonly WorkflowStatusOption[] = [
  { id: 'st-novo', label: 'Novo', slug: 'novo' },
  { id: 'st-triagem', label: 'Em triagem', slug: 'em-triagem' },
  { id: 'st-investigacao', label: 'Em investigação', slug: 'em-investigacao' },
  { id: 'st-aguardando', label: 'Aguardando informações', slug: 'aguardando-informacoes' },
  { id: 'st-encerrado', label: 'Encerrado', slug: 'encerrado' },
  { id: 'st-arquivado', label: 'Arquivado', slug: 'arquivado' },
  { id: 'st-reaberto', label: 'Reaberto', slug: 'reaberto' },
  { id: 'st-escalado', label: 'Escalado', slug: 'escalado' },
] as const
