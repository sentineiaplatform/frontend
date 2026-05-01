import { ResetPasswordForm } from '@/pages/auth/components/reset-password-form'
import { ResetPasswordSidebar } from '@/pages/auth/components/reset-password-sidebar'

/** Redefinição de senha com token na URL (`?token=…`). */
export function ResetPasswordPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-4 md:p-8">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-card text-card-foreground shadow-xl ring-1 ring-border lg:flex-row">
        <ResetPasswordSidebar className="lg:flex-[0_1_42%] lg:min-h-[min(100%,38rem)]" />
        <ResetPasswordForm className="min-w-0 flex-1" />
      </div>
    </div>
  )
}
