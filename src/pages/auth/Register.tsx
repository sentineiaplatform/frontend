import { RegisterForm } from '@/pages/auth/components/register-form'
import { RegisterSidebar } from '@/pages/auth/components/register-sidebar'

/** Cadastro — mesmo cartão split do login (design system). */
export function RegisterPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-4 md:p-8">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-card text-card-foreground shadow-xl ring-1 ring-border lg:flex-row">
        <RegisterSidebar className="lg:flex-[0_1_42%] lg:min-h-[min(100%,38rem)]" />
        <RegisterForm className="min-w-0 flex-1" />
      </div>
    </div>
  )
}
