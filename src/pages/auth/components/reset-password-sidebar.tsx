import { CheckCircle2Icon, ShieldCheckIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  readonly className?: string
}

const highlights = [
  'Use uma senha forte e exclusiva para esta conta.',
  'Após salvar, inicie sessão com o e-mail da conta e a nova senha.',
  'Se o link expirar, solicite nova recuperação na tela anterior.',
]

export function ResetPasswordSidebar({ className }: Props) {
  return (
    <aside
      className={cn(
        'relative flex min-h-[22rem] flex-col justify-between gap-10 bg-brand-navy p-8 text-white md:min-h-0 md:p-10 lg:min-h-0',
        className,
      )}
    >
      <div className="space-y-8">
        <div className="flex items-start gap-4">
          <div className="shrink-0 pt-1" aria-hidden>
            <div className="bg-primary text-primary-foreground ring-primary/35 flex size-11 items-center justify-center rounded-full shadow-sm ring-1">
              <ShieldCheckIcon className="size-[1.125rem]" strokeWidth={2.25} />
            </div>
          </div>
          <div className="pt-1">
            <h2 className="font-heading text-balance text-3xl leading-tight font-bold tracking-tight text-white md:text-[2rem]">
              Defina uma nova senha com segurança.
            </h2>
          </div>
        </div>
      </div>

      <div className="border-white/10 space-y-4 rounded-xl border bg-white/[0.04] p-5">
        <p className="text-sm font-semibold tracking-tight text-white">Lembrete</p>
        <ul className="space-y-3 text-sm leading-snug text-white/90">
          {highlights.map((line) => (
            <li key={line} className="flex gap-3">
              <CheckCircle2Icon
                className="text-primary mt-0.5 size-4 shrink-0"
                aria-hidden
              />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
