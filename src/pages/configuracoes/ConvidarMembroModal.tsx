import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleUserRoundIcon, FileText, Lock, MailIcon, UserIcon, UserPlusIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'

import {
  GenericCrudForm,
  type CrudFormField,
} from '@/components/forms/generic-crud-form'
import { fetchPerfisList } from '@/services/perfil-service'
import { AuthRequestError } from '@/services/auth/types'
import { createUser } from '@/services/user-profile-service'

const convidarMembroSchema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome completo.'),
  email: z.string().trim().email('Informe um e-mail válido.'),
  senha: z.string().min(8, 'A palavra-passe deve ter pelo menos 8 caracteres.'),
  perfilId: z.string().uuid('Selecione um perfil.'),
})

type ConvidarMembroValues = z.infer<typeof convidarMembroSchema>

const defaultValues: ConvidarMembroValues = {
  nome: '',
  email: '',
  senha: '',
  perfilId: '',
}

type ConvidarMembroModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Chamado após criar utilizador com sucesso (ex.: recarregar lista). */
  onCreated?: () => void
}

export function ConvidarMembroModal({
  open,
  onOpenChange,
  onCreated,
}: Readonly<ConvidarMembroModalProps>) {
  const [opcoesPerfil, setOpcoesPerfil] = useState<{ value: string; label: string }[]>([])

  const form = useForm<ConvidarMembroValues>({
    resolver: zodResolver(convidarMembroSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return
    form.reset(defaultValues)
    void (async () => {
      try {
        const list = await fetchPerfisList()
        const opts = list.map((p) => ({ value: p.id, label: p.name }))
        setOpcoesPerfil(opts)
        form.reset({
          nome: '',
          email: '',
          senha: '',
          perfilId: list.length === 1 ? list[0]!.id : '',
        })
      } catch {
        setOpcoesPerfil([])
        form.reset(defaultValues)
        toast.error('Não foi possível carregar os perfis.', {
          description: 'Verifique a sessão e tente novamente.',
        })
      }
    })()
  }, [open, form])

  const fields = useMemo<CrudFormField<ConvidarMembroValues>[]>(
    () => [
      {
        type: 'text',
        name: 'nome',
        label: 'Nome completo',
        placeholder: 'Maria Silva',
        icon: UserIcon,
      },
      {
        type: 'text',
        name: 'email',
        label: 'E-mail',
        inputType: 'email',
        placeholder: 'maria@empresa.com',
        icon: MailIcon,
      },
      {
        type: 'text',
        name: 'senha',
        label: 'Palavra-passe inicial',
        inputType: 'password',
        placeholder: '••••••••',
        icon: Lock,
        description:
          'O utilizador poderá iniciar sessão com este e-mail e alterar a palavra-passe depois.',
        descriptionAriaLabel: 'Informação sobre a palavra-passe inicial',
        fullWidth: true,
      },
      {
        type: 'select',
        name: 'perfilId',
        label: 'Perfil organizacional',
        placeholder: opcoesPerfil.length === 0 ? 'A carregar perfis…' : 'Selecionar perfil…',
        icon: CircleUserRoundIcon,
        options: opcoesPerfil,
        fullWidth: true,
      },
    ],
    [opcoesPerfil],
  )

  if (!open) {
    return null
  }

  function close() {
    onOpenChange(false)
    form.reset(defaultValues)
  }

  function onSubmit(values: ConvidarMembroValues) {
    void (async () => {
      try {
        await createUser({
          name: values.nome.trim(),
          email: values.email.trim(),
          password: values.senha,
          perfilId: values.perfilId,
        })
        toast.success('Utilizador criado.', {
          description: `${values.nome.trim()} · ${values.email.trim().toLowerCase()}`,
        })
        close()
        onCreated?.()
      } catch (err) {
        const msg =
          err instanceof AuthRequestError
            ? err.message
            : 'Não foi possível criar o utilizador.'
        toast.error(msg)
      }
    })()
  }

  return (
    <GenericCrudForm
      title="Convidar membro"
      description="Cria uma conta no servidor com nome, e-mail, palavra-passe inicial e perfil organizacional."
      headerIcon={UserPlusIcon}
      headerDescriptionIcon={FileText}
      submitLabel="Criar utilizador"
      cancelLabel="Cancelar"
      presentation="modal"
      fieldColumns={2}
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      onCancel={close}
    />
  )
}
