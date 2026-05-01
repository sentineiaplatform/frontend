import { canonicalInvestigacaoPhase, type CanonicalInvestigacaoPhase } from '@/pages/denuncias/investigacao-workspace-canonical'
import type { WorkflowRuntimeStep } from '@/pages/denuncias/workflow-runtime'

function normalizeWorkflowLabel(s: string): string {
  return s.trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
}

/**
 * Nós criados no editor com o rótulo automático «Estado N» (ou sem nome → «Estado»)
 * não devem aparecer no rail da investigação — poluem o fluxo sem significado de negócio.
 */
export function isInvestigationRailPlaceholderStep(step: WorkflowRuntimeStep): boolean {
  const raw = step.label.trim()
  if (!raw) return true
  const n = normalizeWorkflowLabel(raw)
  if (n === 'estado') return true
  return /^estado\s*\d+$/.test(n)
}

/** Remove placeholders do rail; se todos caíssem fora, mantém a ordem completa (evita rail vazio). */
export function filterInvestigationRailPlaceholderSteps(
  orderedStepIndices: number[],
  steps: WorkflowRuntimeStep[],
): number[] {
  if (orderedStepIndices.length === 0) return []
  const filtered = orderedStepIndices.filter((idx) => {
    const step = steps[idx]
    return step != null && !isInvestigationRailPlaceholderStep(step)
  })
  return filtered.length > 0 ? filtered : orderedStepIndices
}

/** Quando o índice ativo não está no rail filtrado, escolhe o nó visível mais próximo na ordem canónica do diagrama. */
export function railSnapStepIndex(
  filteredOrder: number[],
  fullOrder: number[],
  stepIdx: number,
): number {
  if (filteredOrder.length === 0) return stepIdx
  if (filteredOrder.includes(stepIdx)) return stepIdx
  const fullPos = fullOrder.indexOf(stepIdx)
  if (fullPos < 0) return filteredOrder[0]!
  for (let p = fullPos; p >= 0; p--) {
    const idx = fullOrder[p]!
    if (filteredOrder.includes(idx)) return idx
  }
  for (let p = fullPos + 1; p < fullOrder.length; p++) {
    const idx = fullOrder[p]!
    if (filteredOrder.includes(idx)) return idx
  }
  return filteredOrder[0]!
}

/**
 * Ordem de negócio do rail de investigação (independente das coordenadas X/Y no editor de Workflows).
 * Mantém-se alinhado ao modelo de etapas em `CANONICAL_PHASE_META`.
 */
const PHASE_ORDER: Record<CanonicalInvestigacaoPhase, number> = {
  recepcao: 0,
  triagem: 1,
  investigacao: 2,
  analise_conclusao: 3,
  plano_acao: 4,
  aprovacao: 5,
  encerramento: 6,
  relatorio_final: 7,
  generico: 100,
}

/**
 * Índices em `steps` ordenados para o rail horizontal (Receção → Triagem → Investigação → …).
 * Usa a ordem do canvas só como desempate quando duas etapas caem na mesma fase canónica.
 */
export function computeInvestigationRailStepOrder(
  steps: WorkflowRuntimeStep[],
  canvasVisualOrder: number[],
): number[] {
  if (steps.length === 0) return []

  const canvasRank = new Map<number, number>()
  canvasVisualOrder.forEach((stepIdx, i) => {
    canvasRank.set(stepIdx, i)
  })

  const indices = steps.map((_, i) => i)
  indices.sort((ai, bi) => {
    const oa = PHASE_ORDER[canonicalInvestigacaoPhase(steps[ai])]
    const ob = PHASE_ORDER[canonicalInvestigacaoPhase(steps[bi])]
    if (oa !== ob) return oa - ob
    return (canvasRank.get(ai) ?? ai) - (canvasRank.get(bi) ?? bi)
  })

  return indices
}
