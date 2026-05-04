import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileText, Gauge, TextAlignStart, ToggleLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'

import {
  GenericCrudForm,
  type CrudFormField,
} from '@/components/forms/generic-crud-form'
import {
  createComplaintPriority,
  fetchComplaintPriorityById,
  updateComplaintPriority,
} from '@/services/complaint-priority-service'

const prioridadeFormSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(1, 'Informe o código.')
    .max(10, 'Máximo 10 caracteres.')
    .toUpperCase(),
  nome: z.string().trim().min(2, 'Informe o nome.').max(100, 'Máximo 100 caracteres.'),
  descricao: z.string().max(500, 'Máximo 500 caracteres.'),
  ativo: z.boolean(),
})

type PrioridadeFormValues = z.infer<typeof prioridadeFormSchema>

const defaultValues: PrioridadeFormValues = {
  codigo: '',
  nome: '',
  descricao: '',
  ativo: true,
}

const fields: CrudFormField<PrioridadeFormValues>[] = [
  {
    type: 'text',
    name: 'codigo',
    label: 'Código',
    placeholder: 'P1',
    icon: Gauge,
  },
  {
    type: 'text',
    name: 'nome',
    label: 'Nome',
    placeholder: 'Urgente',
    icon: Gauge,
  },
  {
    type: 'textarea',
    name: 'descricao',
    label: 'Descrição',
    placeholder: 'Descreva quando essa prioridade deve ser usada.',
    icon: TextAlignStart,
    fullRow: true,
  },
  {
    type: 'switch',
    name: 'ativo',
    label: 'Prioridade ativa',
    description: 'Desative para manter apenas histórico.',
    icon: ToggleLeft,
    fullRow: true,
  },
]

export function PrioridadeDenunciaFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()

  const modalParam = searchParams.get('modal')
  const presentation = modalParam === 'true' || modalParam === '1' ? 'modal' : 'page'
  const isEdit = Boolean(id)
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(isEdit)

  const form = useForm<PrioridadeFormValues>({
    resolver: zodResolver(prioridadeFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!isEdit || !id) {
      setCarregandoDetalhe(false)
      form.reset(defaultValues)
      return
    }
    setCarregandoDetalhe(true)
    void fetchComplaintPriorityById(id)
      .then((dto) => {
        form.reset({
          codigo: dto.code,
          nome: dto.name,
          descricao: dto.description ?? '',
          ativo: dto.active,
        })
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.message === 'not_found') {
          toast.error('Prioridade não encontrada.')
        } else {
          toast.error('Não foi possível carregar a prioridade.')
        }
        navigate('/app/dados-mestres/prioridade-denuncias', { replace: true })
      })
      .finally(() => setCarregandoDetalhe(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit, navigate])

  function closeForm() {
    if (presentation === 'modal') { navigate(-1); return }
    navigate('/app/dados-mestres/prioridade-denuncias')
  }

  function onSubmit(values: PrioridadeFormValues) {
    const body = {
      code: values.codigo.trim().toUpperCase(),
      name: values.nome.trim(),
      description: values.descricao.trim() || null,
      active: values.ativo,
    }
    void (async () => {
      try {
        if (isEdit && id) {
          await updateComplaintPriority(id, body)
          toast.success('Prioridade atualizada.', { description: `${body.code} — ${body.name}` })
        } else {
          await createComplaintPriority(body)
          toast.success('Prioridade criada.', { description: `${body.code} — ${body.name}` })
        }
        closeForm()
      } catch {
        toast.error(isEdit ? 'Não foi possível atualizar a prioridade.' : 'Não foi possível criar a prioridade.')
      }
    })()
  }

  if (isEdit && carregandoDetalhe) {
    return <div className="text-muted-foreground p-8 text-center text-sm">Carregando…</div>
  }

  return (
    <GenericCrudForm
      title={isEdit ? `Editar prioridade — ${form.watch('codigo') || '…'}` : 'Nova prioridade de denúncia'}
      description="Níveis de prioridade utilizados na classificação das denúncias."
      headerIcon={Gauge}
      headerDescriptionIcon={FileText}
      submitLabel={isEdit ? 'Salvar alterações' : 'Criar prioridade'}
      presentation={presentation}
      fieldColumns={presentation === 'modal' ? 2 : 3}
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      onCancel={closeForm}
    />
  )
}
