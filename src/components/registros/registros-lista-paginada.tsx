import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type RegistrosListaPaginacao = {
  /** Página atual (base 1). */
  paginaAtual: number
  itensPorPagina: number
  totalItens: number
  onPaginaChange: (pagina: number) => void
  /** Se informado com `onItensPorPaginaChange`, exibe seletor “Linhas por página”. */
  opcoesItensPorPagina?: readonly number[]
  onItensPorPaginaChange?: (quantidade: number) => void
}

function calcularIntervalo(
  paginaAtual: number,
  itensPorPagina: number,
  totalItens: number,
) {
  if (totalItens <= 0) return { inicio: 0, fim: 0 }
  const inicio = (paginaAtual - 1) * itensPorPagina + 1
  const fim = Math.min(paginaAtual * itensPorPagina, totalItens)
  return { inicio, fim }
}

type BlocoPagina =
  | { kind: 'page'; n: number }
  | { kind: 'gap'; left: number; right: number }

/** Janela de números de página com reticências (estilo lista “enterprise”). */
function paginasVisiveis(atual: number, total: number): BlocoPagina[] {
  if (total <= 0) return []
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => ({
      kind: 'page' as const,
      n: i + 1,
    }))
  }
  const s = new Set<number>()
  s.add(1)
  s.add(total)
  s.add(atual)
  s.add(atual - 1)
  s.add(atual + 1)
  const sorted = [...s].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b)
  const out: BlocoPagina[] = []
  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i]!
    const prev = sorted[i - 1]
    if (prev !== undefined && cur - prev > 1) {
      out.push({ kind: 'gap', left: prev, right: cur })
    }
    out.push({ kind: 'page', n: cur })
  }
  return out
}

/** Contêiner de tabela + barra de paginação reutilizável para listagens globais. */
export function RegistrosListaPaginada({
  children,
  paginacao,
  className,
  areaLabel = 'Lista de registros',
}: Readonly<{
  children: ReactNode
  paginacao: RegistrosListaPaginacao
  className?: string
  /** Rótulo acessível da região da tabela. */
  areaLabel?: string
}>) {
  const {
    paginaAtual,
    itensPorPagina,
    totalItens,
    onPaginaChange,
    opcoesItensPorPagina,
    onItensPorPaginaChange,
  } = paginacao

  const totalPaginas =
    totalItens <= 0 ? 0 : Math.max(1, Math.ceil(totalItens / itensPorPagina))
  const paginaSegura =
    totalPaginas <= 0 ? 1 : Math.min(Math.max(1, paginaAtual), totalPaginas)
  const { inicio, fim } = calcularIntervalo(paginaSegura, itensPorPagina, totalItens)

  const podeAnterior = totalItens > 0 && paginaSegura > 1
  const podeProxima = totalItens > 0 && paginaSegura < totalPaginas
  const mostrarSeletorLinhas =
    opcoesItensPorPagina &&
    opcoesItensPorPagina.length > 0 &&
    typeof onItensPorPaginaChange === 'function'

  const blocos = paginasVisiveis(paginaSegura, totalPaginas)

  return (
    <div className={cn('flex flex-col gap-0', className)}>
      <section
        aria-label={areaLabel}
        className="border-border/40 bg-background overflow-hidden rounded-xl border"
      >
        {children}
      </section>

      <footer className="border-border/40 text-muted-foreground mt-0 flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-[13px]">
          {totalItens === 0 ? (
            <span>Nenhum registro encontrado.</span>
          ) : (
            <>
              <span>
                Visualizando{' '}
                <span className="text-foreground font-medium tabular-nums">
                  {inicio} – {fim}
                </span>{' '}
                de{' '}
                <span className="text-foreground font-medium tabular-nums">
                  {totalItens}
                </span>
              </span>
              {mostrarSeletorLinhas ? (
                <>
                  <span className="text-border hidden sm:inline" aria-hidden>
                    |
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="whitespace-nowrap">Linhas por página</span>
                    <Select
                      value={String(itensPorPagina)}
                      onValueChange={(v) => onItensPorPaginaChange(Number(v))}
                    >
                      <SelectTrigger
                        size="sm"
                        aria-label="Linhas por página"
                        className="border-border/60 bg-background h-8 min-w-[4.25rem] rounded-lg px-2 text-xs shadow-none"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent align="start" className="min-w-[5rem]">
                        {opcoesItensPorPagina.map((n) => (
                          <SelectItem key={n} value={String(n)} className="text-xs">
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>

        {totalItens > 0 ? (
          <nav
            className="flex flex-wrap items-center justify-end gap-1"
            aria-label="Paginação da listagem"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8 rounded-full"
              disabled={!podeAnterior}
              aria-label="Página anterior"
              onClick={() => onPaginaChange(paginaSegura - 1)}
            >
              <ChevronLeft className="size-4" aria-hidden />
            </Button>

            <div className="mx-1 flex items-center gap-0.5">
              {blocos.map((b) =>
                b.kind === 'gap' ? (
                  <span
                    key={`gap-${b.left}-${b.right}`}
                    className="text-muted-foreground px-1.5 text-xs font-medium select-none"
                    aria-hidden
                  >
                    …
                  </span>
                ) : (
                  <Button
                    key={`p-${b.n}`}
                    type="button"
                    variant={b.n === paginaSegura ? 'secondary' : 'ghost'}
                    size="icon-sm"
                    className={cn(
                      'size-8 rounded-full font-medium tabular-nums',
                      b.n === paginaSegura &&
                        'bg-muted text-foreground shadow-none hover:bg-muted/90',
                    )}
                    aria-label={`Ir para página ${b.n}`}
                    aria-current={b.n === paginaSegura ? 'page' : undefined}
                    onClick={() => onPaginaChange(b.n)}
                  >
                    {b.n}
                  </Button>
                ),
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8 rounded-full"
              disabled={!podeProxima}
              aria-label="Próxima página"
              onClick={() => onPaginaChange(paginaSegura + 1)}
            >
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </nav>
        ) : null}
      </footer>
    </div>
  )
}
