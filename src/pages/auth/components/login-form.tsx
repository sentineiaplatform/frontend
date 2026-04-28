import { useId, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
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
import { displayNameFromEmail, setSessionDisplayName } from '@/lib/session-user'
import { cn } from '@/lib/utils'

type Props = {
  readonly className?: string
}

/** Formulário — tokens shadcn (`card`, `border`, `primary`, `muted-foreground`). */
export function LoginForm({ className }: Props) {
  const ids = useId()
  const navigate = useNavigate()
  const emailId = `${ids}-email`
  const passwordId = `${ids}-password`
  const rememberId = `${ids}-remember`

  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  })

  function onSubmit(values: LoginFormValues) {
    setSessionDisplayName(displayNameFromEmail(values.email))
    navigate('/dashboard', { replace: true })
    // Integração backend em etapa seguinte
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
          <FieldGroup className="gap-5">
            <Field data-invalid={errors.email ? true : undefined}>
              <FieldLabel htmlFor={emailId}>E-mail</FieldLabel>
              <InputGroup className="h-11 min-h-11 shadow-none">
                <InputGroupAddon
                  align="inline-start"
                  className="text-muted-foreground"
                >
                  <MailIcon className="size-4 shrink-0" aria-hidden />
                </InputGroupAddon>
                <InputGroupInput
                  id={emailId}
                  autoComplete="email"
                  inputMode="email"
                  placeholder="seu-email@empresa.com"
                  className="h-11 min-h-11"
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
              <InputGroup className="h-11 min-h-11 shadow-none">
                <InputGroupAddon
                  align="inline-start"
                  className="text-muted-foreground"
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
                      className="h-11 min-h-11"
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
              <Checkbox id={rememberId} name="remember" />
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

          <Button type="submit" size="lg" className="h-11 w-full gap-2 shadow-sm">
            <LogInIcon className="size-4 shrink-0" aria-hidden />
            Entrar
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
