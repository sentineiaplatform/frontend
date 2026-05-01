import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleDot, FileText, TextAlignStart, ToggleLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'

import {
  GenericCrudForm,
  type CrudFormField,
} from '@/components/forms/generic-crud-form'
import {
  createComplaintStatus,
  fetchComplaintStatusById,
  updateComplaintStatus,
  type ComplaintStatusDto,
} from '@/services/complaint-status-service'

const statusFormSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, 'Informe o nome do status.')
    .max(100, 'Use no máximo 100 caracteres (limite da API).'),
  descricao: z
    .string()
    .max(500, 'Use no máximo 500 caracteres (limite da API).'),
  ativo: z.boolean(),
})

type StatusFormValues = z.infer<typeof statusFormSchema>

const defaultStatusValues: StatusFormValues = {
  nome: '',
  descricao: '',
  ativo: true,
}

const fields: CrudFormField<StatusFormValues>[] = [
  {
    type: 'text',
    name: 'nome',
    label: 'Nome',
    placeholder: 'Aberta',
    icon: CircleDot,
    fullWidth: true,
  },
  {
    type: 'textarea',
    name: 'descricao',
    label: 'Descrição',
    placeholder: 'Explique quando esse status deve ser usado (texto simples).',
    icon: TextAlignStart,
    fullRow: true,
  },
  {
    type: 'switch',
    name: 'ativo',
    label: 'Status ativo',
    description: 'Desative para manter apenas histórico.',
    icon: ToggleLeft,
  },
]

function dtoToForm(dto: ComplaintStatusDto): StatusFormValues {
  return {
    nome: dto.name,
    descricao: dto.description ?? '',
    ativo: dto.active,
  }
}

export function StatusDenunciaFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()

  const modalParam = searchParams.get('modal')
  const presentation =
    modalParam === 'true' || modalParam === '1' ? 'modal' : 'page'
  const isEdit = Boolean(id)
  const [remoto, setRemoto] = useState<ComplaintStatusDto | null>(null)
  const [carregando, setCarregando] = useState(isEdit)

  const defaultValues = useMemo<StatusFormValues>(() => {
    if (!remoto) return defaultStatusValues
    return dtoToForm(remoto)
  }, [remoto])

  const form = useForm<StatusFormValues>({
    resolver: zodResolver(statusFormSchema),
    defaultValues,
  })

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  useEffect(() => {
    if (!isEdit || !id) return
    let cancelado = false
    setCarregando(true)
    fetchComplaintStatusById(id)
      .then((dto) => {
        if (!cancelado) setRemoto(dto)
      })
      .catch((err: Error) => {
        if (cancelado) return
        if (err.message === 'not_found') {
          toast.error('Status não encontrado.')
          navigate('/app/dados-mestres/status-denuncias', { replace: true })
          return
        }
        toast.error('Não foi possível carregar o status.')
        navigate('/app/dados-mestres/status-denuncias', { replace: true })
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })
    return () => {
      cancelado = true
    }
  }, [id, isEdit, navigate])

  function closeForm() {
    if (presentation === 'modal') {
      navigate(-1)
      return
    }
    navigate('/app/dados-mestres/status-denuncias')
  }

  function onSubmit(values: StatusFormValues) {
    const descTrim = values.descricao.trim()
    const body = {
      name: values.nome.trim(),
      description: descTrim.length > 0 ? descTrim : null,
      active: values.ativo,
    }
    const done = () => {
      toast.success(isEdit ? 'Status atualizado.' : 'Status criado.', {
        description: values.nome.trim(),
      })
      closeForm()
    }
    const fail = () => {
      toast.error(isEdit ? 'Não foi possível atualizar o status.' : 'Não foi possível criar o status.')
    }
    if (isEdit && id) {
      void updateComplaintStatus(id, body).then(done, fail)
      return
    }
    void createComplaintStatus(body).then(done, fail)
  }

  if (isEdit && carregando) return null
  if (isEdit && !remoto) return null

  return (
    <GenericCrudForm
      title={isEdit ? `Editar status — ${remoto?.name ?? ''}` : 'Novo status de denúncia'}
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
