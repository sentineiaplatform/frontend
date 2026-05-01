import type { LucideIcon } from 'lucide-react'
import { ArrowDownUp } from 'lucide-react'

import { plainTextFromHtml } from '@/lib/html-plain-text'
import { cn } from '@/lib/utils'

export const LINHAS_DADOS_MESTRES = [10, 20, 35, 50] as const

export function formatoDataHora(iso: string) {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function CabecalhoColuna({
  icone: Icon,
  rotulo,
  alinhar = 'left',
}: Readonly<{
  icone: LucideIcon
  rotulo: string
  alinhar?: 'left' | 'right'
}>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        alinhar === 'right' && 'ml-auto w-full justify-end',
      )}
    >
      <Icon
        className="text-muted-foreground/70 size-3 shrink-0"
        aria-hidden
        strokeWidth={1.75}
      />
      <span className="font-medium">{rotulo}</span>
      <ArrowDownUp className="text-muted-foreground/35 size-2.5 shrink-0 opacity-70" aria-hidden strokeWidth={1.75} />
    </span>
  )
}

export function CabecalhoColunaAcoes() {
  return (
    <span className="text-muted-foreground block w-full text-center text-[10px] font-semibold tracking-wide uppercase">
      Ações
    </span>
  )
}

/** Checkbox “marcar página” no cabeçalho da tabela. */
export function estadoCabecalhoSelecaoPagina(
  totalLinhas: number,
  marcadosNaPagina: number,
): boolean | 'indeterminate' {
  if (totalLinhas === 0) return false
  if (marcadosNaPagina === 0) return false
  if (marcadosNaPagina === totalLinhas) return true
  return 'indeterminate'
}

export function pinTdCheckbox(sel: boolean) {
  return cn(
    'pin-checkbox sticky left-0 z-[25] border-r border-border/40 backdrop-blur-[1px]',
    'w-11 min-w-[2.75rem] px-2 py-2.5 align-middle',
    sel ? 'bg-muted/48' : 'bg-background',
    'group-hover/table-row:bg-muted/12 dark:bg-background dark:group-hover/table-row:bg-muted/15',
  )
}

export function pinTdAcoes(sel: boolean) {
  return cn(
    'pin-actions sticky right-0 z-[35] w-[1%] whitespace-nowrap border-l border-border/40 px-2 py-2 align-middle text-right',
    'backdrop-blur-[1px] shadow-[-14px_0_20px_-12px_rgba(0,0,0,0.06)] dark:shadow-black/35',
    sel ? 'bg-muted/48' : 'bg-background',
    'group-hover/table-row:bg-muted/12 dark:bg-background dark:group-hover/table-row:bg-muted/15',
  )
}

/** Rich text / HTML (ex.: LexKit) como texto plano na listagem, com truncagem e `title` para hover. */
export function CelulaTextoRico({
  html,
  className,
  variant = 'multiline',
}: Readonly<{
  html: string
  className?: string
  variant?: 'multiline' | 'single'
}>) {
  const plain = plainTextFromHtml(html)
  if (!plain) {
    return <span className={cn('text-muted-foreground', className)}>—</span>
  }
  return (
    <span
      className={cn(
        'block min-w-0 whitespace-normal',
        variant === 'multiline' ? 'line-clamp-2 break-words' : 'truncate',
        className,
      )}
      title={plain}
    >
      {plain}
    </span>
  )
}

/** Pill para colunas booleanas em listagens CRUD (rótulos legíveis, não só cor). */
export function CelulaValorBooleano({
  value,
  className,
}: Readonly<{
  value: boolean
  className?: string
}>) {
  const ativo = value === true
  const rotulo = ativo ? 'Ativo' : 'Inativo'
  return (
    <span
      role="status"
      aria-label={rotulo}
      className={cn(
        'inline-flex max-w-full items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        ativo
          ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400'
          : 'border-rose-500/25 bg-rose-500/10 text-rose-800 dark:border-rose-500/35 dark:bg-rose-500/15 dark:text-rose-300',
        className,
      )}
    >
      {rotulo}
    </span>
  )
}
