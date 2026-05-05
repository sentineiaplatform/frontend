import type { WorkflowRuntimeStep } from '@/pages/denuncias/workflow-runtime'

/**
 * Fases canónicas da investigação (UI). O rótulo do nó no workflow é mapeado por heurística no label.
 */
export type CanonicalInvestigacaoPhase =
  | 'recepcao'
  | 'triagem'
  | 'investigacao'
  | 'analise_conclusao'
  | 'plano_acao'
  | 'aprovacao'
  | 'encerramento'
  | 'relatorio_final'
  | 'generico'

function L(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
}

/** Resolve a fase de UI a partir do estado do fluxo guardado em Workflows. */
export function canonicalInvestigacaoPhase(
  step: WorkflowRuntimeStep | undefined,
): CanonicalInvestigacaoPhase {
  if (!step) return 'generico'
  const l = L(step.label)

  if (l.includes('rececao') || l.includes('receber') || l.includes('recep')) return 'recepcao'
  if (l.includes('triagem') || l.includes('classific')) return 'triagem'
  if (l.includes('relatorio') && (l.includes('final') || l.includes('fin'))) return 'relatorio_final'
  if (l.includes('encerr')) return 'encerramento'
  if (l.includes('aprov')) return 'aprovacao'
  if (l.includes('plano') && l.includes('acao')) return 'plano_acao'
  if (l.includes('plano')) return 'plano_acao'
  if (l.includes('analise') || l.includes('conclus')) return 'analise_conclusao'
  if (l.includes('investig')) return 'investigacao'

  return 'generico'
}

export function isRececaoWorkspaceStep(step: WorkflowRuntimeStep | undefined): boolean {
  return canonicalInvestigacaoPhase(step) === 'recepcao'
}

export function isTriagemWorkspaceStep(step: WorkflowRuntimeStep | undefined): boolean {
  return canonicalInvestigacaoPhase(step) === 'triagem'
}

export const CANONICAL_PHASE_META: Record<
  CanonicalInvestigacaoPhase,
  { titulo: string; objetivo: string }
> = {
  recepcao: {
    titulo: 'Recepção',
    objetivo: 'Leitura inicial e entendimento completo do relato original.',
  },
  triagem: {
    titulo: 'Triagem',
    objetivo: 'Receção, classificação inicial e decisão de rota.',
  },
  investigacao: {
    titulo: 'Investigação',
    objetivo: 'Coletar evidências, entrevistas e linha do tempo.',
  },
  analise_conclusao: {
    titulo: 'Análise e conclusão',
    objetivo: 'Transformar evidência em decisão fundamentada.',
  },
  plano_acao: {
    titulo: 'Plano de ação',
    objetivo: 'Corrigir causas e acompanhar prazos.',
  },
  aprovacao: {
    titulo: 'Aprovação',
    objetivo: 'Governança: validação formal por níveis.',
  },
  encerramento: {
    titulo: 'Encerramento',
    objetivo: 'Fechar o caso com registo e responsável final.',
  },
  relatorio_final: {
    titulo: 'Relatório final',
    objetivo: 'Documento auditável e exportável.',
  },
  generico: {
    titulo: 'Etapa do fluxo',
    objetivo: 'Área de trabalho alinhada ao diagrama em Dados mestres → Workflows.',
  },
}
