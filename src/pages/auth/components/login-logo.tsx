import { cn } from '@/lib/utils'
import { SentineLogo } from '@/components/brand/sentine-logo'

type LoginLogoProps = {
  readonly placement?: 'form' | 'sidebar'
  readonly className?: string
}

/** Marca vectorial (“Sentine” + IA em `--primary`). */
export function LoginLogo({ placement = 'form', className }: LoginLogoProps) {
  const onDark = placement === 'sidebar'
  return (
    <div className={cn('flex justify-center', className)}>
      <SentineLogo size="md" tone={onDark ? 'onDark' : 'default'} />
    </div>
  )
}
