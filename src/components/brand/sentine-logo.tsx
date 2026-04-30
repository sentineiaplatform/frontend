import { cn } from '@/lib/utils'

type Tone = 'default' | 'onDark'

export type SentineLogoProps = {
  readonly tone?: Tone
  readonly size?: 'sm' | 'md' | 'lg'
  readonly className?: string
  /** Ex.: versão do app — mostra um badge ao lado do wordmark (ex.: `v1.0.0`). */
  readonly version?: string
}

const sizeClass = {
  sm: { mark: 'size-8', word: 'text-base' },
  md: { mark: 'size-10 md:size-11', word: 'text-lg md:text-xl' },
  lg: { mark: 'size-12 md:size-14', word: 'text-2xl md:text-3xl' },
} as const

/** Escudo + check (`primary`): confiança / compliance nos tokens navy + verde. */
function SentineMark({
  tone,
  className,
}: {
  readonly tone: Tone
  readonly className?: string
}) {
  const dark = tone === 'onDark'
  return (
    <svg viewBox="0 0 48 48" className={cn('shrink-0', className)} aria-hidden>
      <rect
        x="4"
        y="4"
        width="40"
        height="40"
        rx="13"
        className={
          dark
            ? 'fill-white stroke-slate-300'
            : 'fill-brand-navy stroke-brand-navy'
        }
        strokeWidth="1.25"
      />
      <path
        d="M17 24.5 21.8 29.8 31.8 17.8"
        fill="none"
        className="stroke-primary"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Wordmark: “Sentine” neutro / branco sobre escuro + “IA” em verde marca. */
export function SentineLogo({
  tone = 'default',
  size = 'md',
  className,
  version,
}: SentineLogoProps) {
  const s = sizeClass[size]
  const word = cn(
    'font-heading font-bold tracking-tight leading-none',
    s.word,
  )

  const versionLabel =
    version && version.length > 0
      ? version.startsWith('v')
        ? version
        : `v${version}`
      : null

  return (
    <div className={cn('inline-flex min-w-0 items-center gap-2.5 md:gap-3', className)}>
      <SentineMark tone={tone} className={s.mark} />
      <span className="flex min-w-0 select-none items-baseline whitespace-nowrap">
        <span
          className={cn(word, tone === 'onDark' ? 'text-white' : 'text-foreground')}
        >
          Sentine
        </span>
        <span className={cn(word, 'text-primary')}>IA</span>
      </span>
      {versionLabel ? (
        <span
          className={cn(
            'shrink-0 tabular-nums leading-none tracking-tight',
            size === 'sm' ? 'text-[9px]' : 'text-[10px]',
            tone === 'onDark'
              ? cn(
                  'rounded border border-white/[0.12] bg-white/[0.04] px-1.5 py-0.5',
                  'font-medium text-white/45',
                )
              : cn(
                  'rounded-md border border-border/80 bg-muted/60 px-1.5 py-0.5',
                  'font-medium text-muted-foreground',
                ),
          )}
          title={`Versão ${versionLabel}`}
        >
          {versionLabel}
        </span>
      ) : null}
    </div>
  )
}
