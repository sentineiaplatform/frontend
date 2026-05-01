import type { ReactNode } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/** Cartão de secção reutilizável no workspace de investigação (modelo Recepção). */
export function InvestigacaoWorkspaceSecao({
  titulo,
  subtitulo,
  tituloIcon,
  children,
  acao,
  variant = 'painel',
  density = 'default',
}: Readonly<{
  titulo: string
  subtitulo?: string
  tituloIcon?: ReactNode
  children: ReactNode
  acao?: ReactNode
  variant?: 'painel' | 'formulario'
  density?: 'default' | 'compact'
}>) {
  const formulario = variant === 'formulario'
  const compact = formulario && density === 'compact'
  return (
    <Card
      className={
        formulario
          ? 'gap-0 rounded-xl border border-border/60 bg-background py-0 shadow-none ring-0'
          : 'border-border/60 shadow-none'
      }
    >
      <CardHeader
        className={cn(
          'space-y-0',
          formulario && compact && 'border-border/50 border-b px-3.5 pt-4 pb-3 sm:px-4',
          formulario && !compact && 'border-border/50 border-b px-4 pt-5 pb-4 sm:px-5',
          !formulario && 'px-3 py-2',
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div
            className={cn(
              'flex min-w-0 gap-2.5',
              formulario && tituloIcon ? 'items-start' : 'items-center',
            )}
          >
            {formulario && tituloIcon ? (
              <span
                className={cn(
                  'bg-primary/8 text-primary border-primary/12 mt-0.5 flex shrink-0 items-center justify-center rounded-lg border shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
                  compact ? 'size-8 sm:size-9' : 'size-9 sm:size-10',
                )}
                aria-hidden
              >
                {tituloIcon}
              </span>
            ) : null}
            <div className="min-w-0">
              <CardTitle
                className={
                  formulario
                    ? cn(
                        'font-heading font-semibold tracking-tight',
                        compact ? 'text-lg' : 'text-xl',
                      )
                    : 'font-heading text-sm font-semibold leading-tight'
                }
              >
                {titulo}
              </CardTitle>
              {subtitulo ? (
                <CardDescription
                  className={
                    formulario
                      ? cn(
                          'text-muted-foreground leading-snug',
                          compact ? 'mt-1 text-xs' : 'mt-1.5 text-sm',
                        )
                      : 'text-muted-foreground mt-0.5 text-[11px] leading-snug'
                  }
                >
                  {subtitulo}
                </CardDescription>
              ) : null}
            </div>
          </div>
          {acao}
        </div>
      </CardHeader>
      <CardContent
        className={
          formulario && compact
            ? 'space-y-3 px-3.5 py-4 sm:px-4 sm:py-4'
            : formulario
              ? 'space-y-4 px-4 py-5 sm:px-5 sm:py-6'
              : 'space-y-2 px-3 pt-0 pb-3'
        }
      >
        {children}
      </CardContent>
    </Card>
  )
}
