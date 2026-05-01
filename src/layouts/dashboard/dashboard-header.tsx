import {
  BellIcon,
  CircleUserIcon,
  LayoutGridIcon,
  LogOutIcon,
  MailIcon,
  UserIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { SentineLogo } from '@/components/brand/sentine-logo'
import { APP_VERSION } from '@/lib/app-version'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/auth-context'
import { useSessionDisplayName } from '@/hooks/use-session-display-name'
import { useSessionEmail } from '@/hooks/use-session-email'
import { displayNameInitials } from '@/lib/session-user'
import { cn } from '@/lib/utils'

/** Ações do header sobre `bg-brand-navy`: neutraliza `ghost` (muted/foreground) do Button. */
const headerIconButtonClass = cn(
  'text-white',
  'hover:bg-white/12 hover:text-white',
  'dark:hover:bg-white/12 dark:hover:text-white',
  'active:bg-white/18',
  'focus-visible:border-white/30 focus-visible:ring-white/25',
  'aria-expanded:bg-white/10 aria-expanded:text-white',
  '[&_svg]:text-white',
)

/** Contador exibido até existir feed de notificações (API). */
const UNREAD_NOTIFICATION_COUNT = 3

/** Barra superior global — navy, logo + ações. */
export function DashboardHeader() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const displayName = useSessionDisplayName()
  const sessionEmail = useSessionEmail()
  const initials = displayName.trim() ? displayNameInitials(displayName) : '?'

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const notificationsLabel =
    UNREAD_NOTIFICATION_COUNT > 0
      ? `Notificações, ${UNREAD_NOTIFICATION_COUNT} não lidas`
      : 'Notificações'

  return (
    <header
      className={cn(
        'bg-brand-navy text-white',
        'border-b border-white/15',
        'fixed inset-x-0 top-0 z-50 flex min-h-14 w-full shrink-0 flex-wrap items-center gap-3 px-4 py-2.5 md:gap-4 md:px-6',
      )}
    >
      <div className="flex min-w-0 shrink-0 items-center gap-2 md:gap-3">
        <SentineLogo tone="onDark" size="sm" className="min-w-0" version={APP_VERSION} />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        <span className="relative inline-flex shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={headerIconButtonClass}
            aria-label={notificationsLabel}
          >
            <BellIcon className="size-[1.125rem]" aria-hidden />
          </Button>
          {UNREAD_NOTIFICATION_COUNT > 0 ? (
            <span
              className={cn(
                'pointer-events-none absolute -top-0.5 -right-0.5 flex min-h-[18px] min-w-[18px] items-center justify-center',
                'rounded-full bg-destructive px-1 text-[10px] leading-none font-semibold text-white',
                'ring-2 ring-brand-navy',
              )}
              aria-hidden
            >
              {UNREAD_NOTIFICATION_COUNT > 99 ? '99+' : UNREAD_NOTIFICATION_COUNT}
            </span>
          ) : null}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={headerIconButtonClass}
          aria-label="Atalhos do sistema"
        >
          <LayoutGridIcon className="size-[1.125rem]" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className={cn(
                headerIconButtonClass,
                'h-9 gap-2 rounded-lg px-2 sm:rounded-full sm:pl-3 sm:pr-1',
              )}
              aria-label="Conta"
            >
              <span className="text-white/92 hidden max-w-[10rem] truncate text-left text-[0.8125rem] leading-tight font-medium sm:inline md:max-w-[12rem]">
                {displayName.trim() === '' ? 'Convidado' : displayName}
              </span>
              <Avatar className="size-9 shrink-0 border border-white/25">
                <AvatarFallback className="bg-primary/90 text-[0.6875rem] font-medium text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[14rem]" collisionPadding={12}>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-2 py-1">
                <div className="flex min-w-0 items-start gap-2">
                  <CircleUserIcon
                    className="text-muted-foreground mt-0.5 size-4 shrink-0"
                    aria-hidden
                  />
                  <span className="text-foreground text-sm leading-snug font-medium">
                    {displayName.trim() === '' ? 'Convidado' : displayName}
                  </span>
                </div>
                <div className="flex min-w-0 items-start gap-2">
                  <MailIcon
                    className="text-muted-foreground mt-0.5 size-4 shrink-0"
                    aria-hidden
                  />
                  <span className="text-muted-foreground max-w-[240px] truncate text-xs leading-snug">
                    {sessionEmail !== '' ? sessionEmail : '—'}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onSelect={() => navigate('/app/configuracoes/perfil')}
            >
              <UserIcon className="size-4" aria-hidden />
              Minha conta
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer gap-2"
              onSelect={(e) => {
                e.preventDefault()
                void handleLogout()
              }}
            >
              <LogOutIcon className="size-4" aria-hidden />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
