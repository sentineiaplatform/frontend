import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** Cabeçalho padrão para telas de listagem global de registros (título + descrição + ações). */
export function RegistrosPageHeader({
  title,
  description,
  children,
  className,
}: Readonly<{
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  className?: string
}>) {
  return (
    <header
      className={cn(
        'flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3',
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <h1 className="text-foreground font-heading text-balance text-2xl font-semibold tracking-tight md:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      {children ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          {children}
        </div>
      ) : null}
    </header>
  )
}
