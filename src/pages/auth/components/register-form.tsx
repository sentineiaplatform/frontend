import { useId, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import {
  AlertCircleIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  UserIcon,
  UserPlusIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import {
  type RegisterFormValues,
  registerSchema,
} from '@/pages/auth/register-schema'
import { cn } from '@/lib/utils'

type Props = {
  readonly className?: string
}

/** Cadastro — nome, e-mail, senha e confirmação (tokens do login). */
export function RegisterForm({ className }: Props) {
  const ids = useId()
  const nameId = `${ids}-name`
  const emailId = `${ids}-email`
  const passwordId = `${ids}-password`
  const confirmId = `${ids}-confirm`

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  })

  function onSubmit(_values: RegisterFormValues) {
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
              Criar conta
            </h1>
            <FieldDescription className="mt-1.5 font-normal">
              Preencha seus dados para começar no painel da SentineIA.
            </FieldDescription>
          </div>
        </div>

        <form
          className="space-y-8"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <FieldGroup className="gap-5">
            <Field data-invalid={errors.name ? true : undefined}>
              <FieldLabel htmlFor={nameId}>Nome</FieldLabel>
              <InputGroup className="h-11 min-h-11 shadow-none">
                <InputGroupAddon
                  align="inline-start"
                  className="text-muted-foreground"
                >
                  <UserIcon className="size-4 shrink-0" aria-hidden />
                </InputGroupAddon>
                <InputGroupInput
                  id={nameId}
                  autoComplete="name"
                  placeholder="Seu nome completo"
                  className="h-11 min-h-11"
                  aria-invalid={errors.name ? 'true' : undefined}
                  {...register('name')}
                />
              </InputGroup>
              {errors.name && (
                <FieldError className="flex items-start gap-2 [&>svg]:shrink-0">
                  <AlertCircleIcon className="mt-0.5 size-4" aria-hidden />
                  <span>{errors.name.message}</span>
                </FieldError>
              )}
            </Field>

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
                      autoComplete="new-password"
                      placeholder="Mínimo 8 caracteres"
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

            <Field data-invalid={errors.confirmPassword ? true : undefined}>
              <FieldLabel htmlFor={confirmId}>Confirmar senha</FieldLabel>
              <InputGroup className="h-11 min-h-11 shadow-none">
                <InputGroupAddon
                  align="inline-start"
                  className="text-muted-foreground"
                >
                  <LockIcon className="size-4 shrink-0" aria-hidden />
                </InputGroupAddon>
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <InputGroupInput
                      {...field}
                      id={confirmId}
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Repita a senha"
                      className="h-11 min-h-11"
                      aria-invalid={errors.confirmPassword ? 'true' : undefined}
                    />
                  )}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={
                      showConfirm ? 'Ocultar confirmação' : 'Mostrar confirmação'
                    }
                  >
                    {showConfirm ? (
                      <EyeOffIcon className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {errors.confirmPassword && (
                <FieldError className="flex items-start gap-2 [&>svg]:shrink-0">
                  <AlertCircleIcon className="mt-0.5 size-4" aria-hidden />
                  <span>{errors.confirmPassword.message}</span>
                </FieldError>
              )}
            </Field>
          </FieldGroup>

          <Button type="submit" size="lg" className="h-11 w-full gap-2 shadow-sm">
            <UserPlusIcon className="size-4 shrink-0" aria-hidden />
            Criar conta
          </Button>

          <div className="flex flex-col gap-10 pt-2">
            <FieldSeparator className="-my-0">Ou cadastre-se com</FieldSeparator>
            <LoginSocialButtons />
          </div>
        </form>

        <p className="text-muted-foreground text-center text-sm">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
