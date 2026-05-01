import { useId, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  AlertCircleIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  LogInIcon,
  MailIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { LoginLogo } from '@/pages/auth/components/login-logo'
import { LoginSocialButtons } from '@/pages/auth/components/login-social-buttons'
import { type LoginFormValues, loginSchema } from '@/pages/auth/login-schema'
import { useAuth } from '@/contexts/auth-context'
import { mapAuthErrorToUserMessage } from '@/services/auth/map-auth-error'
import {
  AUTH_INPUT_GROUP_ADDON_CLASS,
  AUTH_INPUT_GROUP_CLASS,
  AUTH_INPUT_GROUP_CONTROL_CLASS,
} from '@/lib/auth-matched-input-group'
import { cn } from '@/lib/utils'

type Props = {
  readonly className?: string
}

/** Formulário — tokens shadcn (`card`, `border`, `primary`, `muted-foreground`). */
export function LoginForm({ className }: Props) {
  const ids = useId()
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const emailId = `${ids}-email`
  const passwordId = `${ids}-password`
  const rememberId = `${ids}-remember`

  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
    mode: 'onTouched',
  })

  async function onSubmit(values: LoginFormValues) {
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      await login(
        { email: values.email, password: values.password },
        { remember: values.remember === true },
      )
      const redirectTo = (location.state as { redirectTo?: string } | null)?.redirectTo
      navigate(
        redirectTo && redirectTo.startsWith('/app') ? redirectTo : '/app/painel',
        { replace: true },
      )
    } catch (e) {
      setSubmitError(mapAuthErrorToUserMessage(e))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col justify-center bg-card px-6 py-10 sm:px-10 lg:py-14',
        className,
      )}
    >
      <div className="mx-auto w-full max-w-md space-y-8">
        <div className="flex w-full flex-col items-center gap-2 text-center">
          <LoginLogo placement="form" />
          <div className="pt-5">
            <h1 className="font-heading text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              Bem-vindo de volta
            </h1>
            <FieldDescription className="mt-1.5 font-normal">
              Digite seus dados para entrar.
            </FieldDescription>
          </div>
        </div>

        <form
          className="space-y-8"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {submitError ? (
            <div
              className="border-destructive/50 bg-destructive/5 text-destructive flex items-start gap-2 rounded-lg border px-3 py-2 text-sm"
              role="alert"
            >
              <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{submitError}</span>
            </div>
          ) : null}
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

            <Field data-invalid={errors.password ? true : undefined}>
              <FieldLabel htmlFor={passwordId}>Senha</FieldLabel>
              <InputGroup className={AUTH_INPUT_GROUP_CLASS}>
                <InputGroupAddon
                  align="inline-start"
                  className={AUTH_INPUT_GROUP_ADDON_CLASS}
                >
                  <LockIcon className="size-4 shrink-0" aria-hidden />
                </InputGroupAddon>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <InputGroupInput
                      {...field}
                      id={passwordId}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="············"
                      className={AUTH_INPUT_GROUP_CONTROL_CLASS}
                      aria-invalid={errors.password ? 'true' : undefined}
                    />
                  )}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? 'Ocultar senha' : 'Mostrar senha'
                    }
                  >
                    {showPassword ? (
                      <EyeOffIcon className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {errors.password && (
                <FieldError className="flex items-start gap-2 [&>svg]:shrink-0">
                  <AlertCircleIcon className="mt-0.5 size-4" aria-hidden />
                  <span>{errors.password.message}</span>
                </FieldError>
              )}
            </Field>
          </FieldGroup>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Controller
                name="remember"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id={rememberId}
                    checked={field.value === true}
                    onCheckedChange={(v) => field.onChange(v === true)}
                  />
                )}
              />
              <FieldLabel
                htmlFor={rememberId}
                className="text-muted-foreground font-normal"
              >
                Lembrar-me
              </FieldLabel>
            </div>
            <Link
              to="/recuperar-senha"
              className="text-primary text-sm font-medium hover:underline"
            >
              Esqueceu a senha?
            </Link>
          </div>

          <Button type="submit" size="lg" className="h-11 w-full gap-2 shadow-sm" disabled={isSubmitting}>
            <LogInIcon className="size-4 shrink-0" aria-hidden />
            {isSubmitting ? 'A entrar…' : 'Entrar'}
          </Button>

          <div className="flex flex-col gap-10 pt-2">
            <FieldSeparator className="-my-0">Ou entre com</FieldSeparator>
            <LoginSocialButtons />
          </div>
        </form>

        <p className="text-muted-foreground text-center text-sm">
          Não tem uma conta?{' '}
          <Link
            to="/cadastro"
            className="text-primary font-medium hover:underline"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}
