import { LoginForm } from '@/pages/auth/components/login-form'
import { LoginSidebar } from '@/pages/auth/components/login-sidebar'

/** Tela de login — formulário sobre `card` e painel com `brand-navy` (design system). */
export function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-4 md:p-8">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-card text-card-foreground shadow-xl ring-1 ring-border lg:flex-row">
        <LoginSidebar className="lg:flex-[0_1_42%] lg:min-h-[min(100%,38rem)]" />
        <LoginForm className="min-w-0 flex-1" />
      </div>
    </div>
  )
}
