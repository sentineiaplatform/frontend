import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
export { isTriagemWorkspaceStep } from '@/pages/denuncias/investigacao-workspace-canonical'

const TRIAGEM_ROWS: ReadonlyArray<{ acao: string; detalhe: string }> = [
  {
    acao: 'Checar admissibilidade',
    detalhe:
      'Relato ofensivo vazio, fora de âmbito, duplicado, manifestamente infundado (critérios na política).',
  },
  {
    acao: 'Pedir complementação',
    detalhe:
      'Se faltar fato/data/local/testemunhas sem violar anonimato desnecessariamente.',
  },
  {
    acao: 'Priorizar risco',
    detalhe: 'Gravidade, urgência (segurança, SST, suborno), exposição da organização.',
  },
  {
    acao: 'Conflito de interesse',
    detalhe: 'Verificar se o triador/investigador deve ser afastado; reatribuir.',
  },
  {
    acao: 'Decisão de rota',
    detalhe:
      'Abrir investigação formal, ação corretiva leve, encaminhar a outro comitê (RH, compliance, SESMT), ou arquivar com motivo.',
  },
  {
    acao: 'Documentar',
    detalhe: 'Registo da decisão de triagem e fundamentação não identificante onde couber.',
  },
]

/** @deprecated Prefer `InvestigacaoEtapasCenterColumn` na página unificada de investigação. */
export function TriagemWorkspacePanel() {
  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-muted/10 px-3 py-3 sm:px-4 sm:py-4">
      <div className="space-y-1">
        <h3 className="text-foreground font-heading text-sm font-semibold tracking-tight">
          Fase 2 — Avaliar / triagem
        </h3>
        <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
          Objetivo: decidir se há elementos mínimos, competência, prioridade e próximo passo (investigar,
          pedir informação, encaminhar, arquivar).
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-foreground w-[min(40%,11rem)] whitespace-normal">Ação</TableHead>
            <TableHead className="text-foreground whitespace-normal">Detalhe</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {TRIAGEM_ROWS.map((row) => (
            <TableRow key={row.acao}>
              <TableCell className="text-foreground align-top text-xs font-medium whitespace-normal sm:text-sm">
                {row.acao}
              </TableCell>
              <TableCell className="text-muted-foreground align-top text-xs leading-snug whitespace-normal sm:text-sm">
                {row.detalhe}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
