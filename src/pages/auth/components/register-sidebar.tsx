import { CheckCircle2Icon, UserPlusIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  readonly className?: string
}

const highlights = [
  'Perfil vinculado à sua organização e ao canal de denúncias.',
  'Dados tratados com foco em compliance e sigilo.',
  'Uma conta para acompanhar o que for permitido ao seu papel.',
]

/** Painel institucional — cadastro, mesmo padrão visual do login. */
export function RegisterSidebar({ className }: Props) {
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
              <UserPlusIcon className="size-[1.125rem]" strokeWidth={2.25} />
            </div>
          </div>
          <div className="space-y-6 pt-1">
            <h2 className="font-heading text-balance text-3xl leading-tight font-bold tracking-tight text-white md:text-[2rem]">
              Junte-se ao canal com confiança.
            </h2>
            <blockquote className="text-[0.9375rem] leading-relaxed text-white/90 md:text-base">
              O cadastro identifica você no painel da SentineIA sem expor quem denuncia.
              Seu nome e e-mail seguem as regras de privacidade da sua empresa e do canal
              de compliance.
            </blockquote>
          </div>
        </div>
      </div>

      <div className="border-white/10 space-y-4 rounded-xl border bg-white/[0.04] p-5">
        <p className="text-sm font-semibold tracking-tight text-white">
          Por que criar uma conta
        </p>
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
