import { ForgotPasswordForm } from '@/pages/auth/components/forgot-password-form'
import { ForgotPasswordSidebar } from '@/pages/auth/components/forgot-password-sidebar'

/** Esqueci a senha — mesmo cartão split do login (design system). */
export function ForgotPasswordPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-4 md:p-8">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-card text-card-foreground shadow-xl ring-1 ring-border lg:flex-row">
        <ForgotPasswordSidebar className="lg:flex-[0_1_42%] lg:min-h-[min(100%,38rem)]" />
        <ForgotPasswordForm className="min-w-0 flex-1" />
      </div>
    </div>
  )
}
