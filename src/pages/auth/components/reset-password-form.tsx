import { useId, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
} from 'lucide-react'
import { toast } from 'sonner'
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
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { LoginLogo } from '@/pages/auth/components/login-logo'
import {
  type ResetPasswordFormValues,
  resetPasswordSchema,
} from '@/pages/auth/reset-password-schema'
import {
  AUTH_INPUT_GROUP_ADDON_CLASS,
  AUTH_INPUT_GROUP_CLASS,
  AUTH_INPUT_GROUP_CONTROL_CLASS,
} from '@/lib/auth-matched-input-group'
import { cn } from '@/lib/utils'
import { requestResetPassword } from '@/services/auth/reset-password-request'

type Props = {
  readonly className?: string
}

export function ResetPasswordForm({ className }: Props) {
  const ids = useId()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = useMemo(() => {
    const raw = searchParams.get('token')
    return raw != null && raw.trim().length > 0 ? raw.trim() : null
  }, [searchParams])

  const passwordId = `${ids}-password`
  const confirmId = `${ids}-confirm`
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onTouched',
  })

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!token) return
    setSubmitting(true)
    try {
      await requestResetPassword(token, values.password)
      setDone(true)
      toast.success('Senha atualizada. Já pode entrar com a nova senha.')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao redefinir senha.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div
        className={cn(
          'flex flex-col justify-center bg-card px-6 py-10 sm:px-10 lg:py-14',
          className,
        )}
      >
        <div className="mx-auto w-full max-w-md space-y-6 text-center">
          <LoginLogo placement="form" />
          <div className="space-y-2">
            <h1 className="text-foreground font-heading text-2xl font-bold tracking-tight">
              Link inválido
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Abra o link completo enviado por e-mail ou solicite uma nova recuperação de senha.
            </p>
          </div>
          <Button asChild variant="default" className="w-full">
            <Link to="/recuperar-senha">Solicitar novo link</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/login">Voltar ao login</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div
        className={cn(
          'flex flex-col justify-center bg-card px-6 py-10 sm:px-10 lg:py-14',
          className,
        )}
      >
        <div className="mx-auto w-full max-w-md space-y-6 text-center">
          <LoginLogo placement="form" />
          <p className="text-foreground text-sm leading-relaxed">
            A sua senha foi atualizada. Use a nova senha no próximo acesso.
          </p>
          <Button
            type="button"
            className="w-full gap-2"
            onClick={() => navigate('/login', { replace: true })}
          >
            Ir para o login
            <ArrowRightIcon className="size-4 shrink-0" aria-hidden />
          </Button>
        </div>
      </div>
    )
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
                Nova senha
              </h1>
              <FieldDescription className="mt-1.5 font-normal">
                Defina e confirme a nova senha para a sua conta.
              </FieldDescription>
            </div>
          </div>
        </div>

        <form className="space-y-8" noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="gap-5">
            <Field data-invalid={errors.password ? true : undefined}>
              <FieldLabel htmlFor={passwordId}>Nova senha</FieldLabel>
              <InputGroup className={AUTH_INPUT_GROUP_CLASS}>
                <InputGroupAddon
                  align="inline-start"
                  className={AUTH_INPUT_GROUP_ADDON_CLASS}
                >
                  <LockIcon className="size-4 shrink-0" aria-hidden />
                </InputGroupAddon>
                <InputGroupInput
                  id={passwordId}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  className={AUTH_INPUT_GROUP_CONTROL_CLASS}
                  aria-invalid={errors.password ? 'true' : undefined}
                  {...register('password')}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="rounded-md"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="size-4" aria-hidden />
                    ) : (
                      <EyeIcon className="size-4" aria-hidden />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {errors.password ? (
                <FieldError className="flex items-start gap-2 [&>svg]:shrink-0">
                  <AlertCircleIcon className="mt-0.5 size-4" aria-hidden />
                  <span>{errors.password.message}</span>
                </FieldError>
              ) : null}
            </Field>

            <Field data-invalid={errors.confirmPassword ? true : undefined}>
              <FieldLabel htmlFor={confirmId}>Confirmar nova senha</FieldLabel>
              <InputGroup className={AUTH_INPUT_GROUP_CLASS}>
                <InputGroupAddon
                  align="inline-start"
                  className={AUTH_INPUT_GROUP_ADDON_CLASS}
                >
                  <LockIcon className="size-4 shrink-0" aria-hidden />
                </InputGroupAddon>
                <InputGroupInput
                  id={confirmId}
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repita a nova senha"
                  className={AUTH_INPUT_GROUP_CONTROL_CLASS}
                  aria-invalid={errors.confirmPassword ? 'true' : undefined}
                  {...register('confirmPassword')}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="rounded-md"
                    aria-label={showConfirm ? 'Ocultar confirmação' : 'Mostrar confirmação'}
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    {showConfirm ? (
                      <EyeOffIcon className="size-4" aria-hidden />
                    ) : (
                      <EyeIcon className="size-4" aria-hidden />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {errors.confirmPassword ? (
                <FieldError className="flex items-start gap-2 [&>svg]:shrink-0">
                  <AlertCircleIcon className="mt-0.5 size-4" aria-hidden />
                  <span>{errors.confirmPassword.message}</span>
                </FieldError>
              ) : null}
            </Field>
          </FieldGroup>

          <Button type="submit" size="lg" className="h-11 w-full gap-2 shadow-sm" disabled={submitting}>
            {submitting ? 'A guardar…' : 'Guardar nova senha'}
            <ArrowRightIcon className="size-4 shrink-0" aria-hidden />
          </Button>
        </form>
      </div>
    </div>
  )
}
