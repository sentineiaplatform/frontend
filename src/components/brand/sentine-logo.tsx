import { cn } from '@/lib/utils'

type Tone = 'default' | 'onDark'

export type SentineLogoProps = {
  readonly tone?: Tone
  readonly size?: 'sm' | 'md' | 'lg'
  readonly className?: string
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
}: SentineLogoProps) {
  const s = sizeClass[size]
  const word = cn(
    'font-heading font-bold tracking-tight leading-none',
    s.word,
  )

  return (
    <div className={cn('inline-flex items-center gap-2.5 md:gap-3', className)}>
      <SentineMark tone={tone} className={s.mark} />
      <span className="flex select-none items-baseline whitespace-nowrap">
        <span
          className={cn(word, tone === 'onDark' ? 'text-white' : 'text-foreground')}
        >
          Sentine
        </span>
        <span className={cn(word, 'text-primary')}>IA</span>
      </span>
    </div>
  )
}
