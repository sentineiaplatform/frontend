import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { AlertCircleIcon, ArrowLeftIcon, ArrowRightIcon, MailIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { LoginLogo } from '@/pages/auth/components/login-logo'
import {
  type ForgotPasswordFormValues,
  forgotPasswordSchema,
} from '@/pages/auth/forgot-password-schema'
import {
  AUTH_INPUT_GROUP_ADDON_CLASS,
  AUTH_INPUT_GROUP_CLASS,
  AUTH_INPUT_GROUP_CONTROL_CLASS,
} from '@/lib/auth-matched-input-group'
import { cn } from '@/lib/utils'

type Props = {
  readonly className?: string
}

/** Solicita recuperação por e-mail — mesmos tokens da tela de login. */
export function ForgotPasswordForm({ className }: Props) {
  const ids = useId()
  const emailId = `${ids}-email`
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onTouched',
  })

  function onSubmit(_values: ForgotPasswordFormValues) {
    // Integração backend em etapa seguinte
    setSent(true)
  }

  return (
    <div
      className={cn(
        'flex flex-col justify-center bg-card px-6 py-10 sm:px-10 lg:py-14',
        className,
      )}
    >
      <div className="mx-auto w-full max-w-md space-y-8">
        <div>
          <Link
            to="/login"
            className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeftIcon className="size-4 shrink-0" aria-hidden />
            Voltar ao login
          </Link>
          <div className="flex w-full flex-col items-center gap-2 text-center">
            <LoginLogo placement="form" />
            <div className="pt-5">
              <h1 className="font-heading text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                Esqueceu a senha?
              </h1>
              <FieldDescription className="mt-1.5 font-normal">
                Informe seu e-mail corporativo. Se houver conta vinculada, enviamos o
                link para redefinir a senha.
              </FieldDescription>
            </div>
          </div>
        </div>

        {sent ? (
          <output
            aria-live="polite"
            className="bg-muted/60 border-border/80 block space-y-4 rounded-xl border px-5 py-6 text-center"
          >
            <p className="text-foreground text-sm leading-relaxed">
              Se esse e-mail estiver cadastrado na SentineIA, você receberá em instantes as
              instruções para criar uma nova senha. Verifique também a pasta de spam.
            </p>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/login">Voltar ao login</Link>
            </Button>
          </output>
        ) : (
          <form
            className="space-y-8"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <FieldGroup className="gap-5">
              <Field data-invalid={errors.email ? true : undefined}>
                <FieldLabel htmlFor={emailId}>E-mail</FieldLabel>
                <InputGroup className={AUTH_INPUT_GROUP_CLASS}>
                  <InputGroupAddon
                    align="inline-start"
                    className={AUTH_INPUT_GROUP_ADDON_CLASS}
                  >
                    <MailIcon className="size-4 shrink-0" aria-hidden />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={emailId}
                    autoComplete="email"
                    inputMode="email"
                    placeholder="seu-email@empresa.com"
                    className={AUTH_INPUT_GROUP_CONTROL_CLASS}
                    aria-invalid={errors.email ? 'true' : undefined}
                    {...register('email')}
                  />
                </InputGroup>
                {errors.email && (
                  <FieldError className="flex items-start gap-2 [&>svg]:shrink-0">
                    <AlertCircleIcon className="mt-0.5 size-4" aria-hidden />
                    <span>{errors.email.message}</span>
                  </FieldError>
                )}
              </Field>
            </FieldGroup>

            <Button type="submit" size="lg" className="h-11 w-full gap-2 shadow-sm">
              Enviar link de recuperação
              <ArrowRightIcon className="size-4 shrink-0" aria-hidden />
            </Button>
          </form>
        )}

        <p className="text-muted-foreground text-center text-sm">
          Lembrou a senha?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
