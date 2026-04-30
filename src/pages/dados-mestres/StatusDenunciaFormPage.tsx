import { useEffect, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleDot, FileText, Hash, ListOrdered, TextAlignStart, ToggleLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'

import {
  GenericCrudForm,
  type CrudFormField,
} from '@/components/forms/generic-crud-form'
import { textoPlanoDeHtml } from '@/lib/html-plain-text'
import { STATUS_DENUNCIAS_MOCK } from '@/pages/dados-mestres/dados-mestres-mock'

const statusFormSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(2, 'Informe ao menos 2 caracteres.')
    .max(8, 'Use no máximo 8 caracteres.'),
  nome: z.string().trim().min(2, 'Informe o nome do status.'),
  descricao: z
    .string()
    .refine((s) => textoPlanoDeHtml(s).length >= 5, {
      message: 'Inclua uma descrição mais completa (texto visível).',
    }),
  ordem: z.number().int().min(1, 'A ordem deve ser maior que zero.'),
  ativo: z.boolean(),
})

type StatusFormValues = z.infer<typeof statusFormSchema>

const defaultStatusValues: StatusFormValues = {
  codigo: '',
  nome: '',
  descricao: '',
  ordem: 1,
  ativo: true,
}

const fields: CrudFormField<StatusFormValues>[] = [
  { type: 'text', name: 'codigo', label: 'Código', placeholder: 'AB', icon: Hash },
  { type: 'text', name: 'nome', label: 'Nome', placeholder: 'Aberta', icon: CircleDot },
  {
    type: 'richtext',
    name: 'descricao',
    label: 'Descrição',
    placeholder: 'Explique quando esse status deve ser usado.',
    icon: TextAlignStart,
  },
  { type: 'number', name: 'ordem', label: 'Ordem', min: 1, icon: ListOrdered },
  {
    type: 'switch',
    name: 'ativo',
    label: 'Status ativo',
    description: 'Desative para manter apenas histórico.',
    icon: ToggleLeft,
  },
]

export function StatusDenunciaFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()

  const modalParam = searchParams.get('modal')
  const presentation =
    modalParam === 'true' || modalParam === '1' ? 'modal' : 'page'
  const isEdit = Boolean(id)
  const current = useMemo(
    () => STATUS_DENUNCIAS_MOCK.find((item) => item.id === id),
    [id],
  )

  const defaultValues = useMemo<StatusFormValues>(() => {
    if (!current) return defaultStatusValues
    return {
      codigo: current.codigo,
      nome: current.nome,
      descricao: current.descricao,
      ordem: current.ordem,
      ativo: current.ativo,
    }
  }, [current])

  const form = useForm<StatusFormValues>({
    resolver: zodResolver(statusFormSchema),
    defaultValues,
  })

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  useEffect(() => {
    if (!isEdit) return
    if (current) return
    toast.error('Status não encontrado.')
    navigate('/app/dados-mestres/status-denuncias', { replace: true })
  }, [current, isEdit, navigate])

  function closeForm() {
    if (presentation === 'modal') {
      navigate(-1)
      return
    }
    navigate('/app/dados-mestres/status-denuncias')
  }

  function onSubmit(values: StatusFormValues) {
    toast.success(isEdit ? 'Status atualizado (mock).' : 'Status criado (mock).', {
      description: `${values.codigo} · ${values.nome}`,
    })
    closeForm()
  }

  if (isEdit && !current) return null

  return (
    <GenericCrudForm
      title={isEdit ? `Editar status ${current?.codigo ?? ''}` : 'Novo status de denúncia'}
      description="Formulário genérico reutilizável com suporte a rota e modal."
      headerIcon={CircleDot}
      headerDescriptionIcon={FileText}
      submitLabel={isEdit ? 'Salvar alterações' : 'Criar status'}
      presentation={presentation}
      fieldColumns={2}
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      onCancel={closeForm}
    />
  )
}
