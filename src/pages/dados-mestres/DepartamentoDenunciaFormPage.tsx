import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { BriefcaseBusiness, FileText, TextAlignStart, ToggleLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'

import {
  GenericCrudForm,
  type CrudFormField,
} from '@/components/forms/generic-crud-form'
import {
  createComplaintDepartment,
  fetchComplaintDepartmentById,
  updateComplaintDepartment,
} from '@/services/complaint-department-service'

const departamentoFormSchema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome.').max(150, 'Máximo 150 caracteres.'),
  descricao: z.string().max(500, 'Máximo 500 caracteres.'),
  ativo: z.boolean(),
})

type DepartamentoFormValues = z.infer<typeof departamentoFormSchema>

const defaultValues: DepartamentoFormValues = {
  nome: '',
  descricao: '',
  ativo: true,
}

const fields: CrudFormField<DepartamentoFormValues>[] = [
  {
    type: 'text',
    name: 'nome',
    label: 'Nome',
    placeholder: 'Compliance & integridade',
    icon: BriefcaseBusiness,
    fullWidth: true,
  },
  {
    type: 'textarea',
    name: 'descricao',
    label: 'Descrição',
    placeholder: 'Descreva a responsabilidade deste departamento.',
    icon: TextAlignStart,
    fullRow: true,
  },
  {
    type: 'switch',
    name: 'ativo',
    label: 'Departamento ativo',
    description: 'Desative para manter apenas histórico.',
    icon: ToggleLeft,
    fullRow: true,
  },
]

export function DepartamentoDenunciaFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()

  const modalParam = searchParams.get('modal')
  const presentation = modalParam === 'true' || modalParam === '1' ? 'modal' : 'page'
  const isEdit = Boolean(id)
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(isEdit)

  const form = useForm<DepartamentoFormValues>({
    resolver: zodResolver(departamentoFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!isEdit || !id) {
      setCarregandoDetalhe(false)
      form.reset(defaultValues)
      return
    }
    setCarregandoDetalhe(true)
    void fetchComplaintDepartmentById(id)
      .then((dto) => {
        form.reset({
          nome: dto.name,
          descricao: dto.description ?? '',
          ativo: dto.active,
        })
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.message === 'not_found') {
          toast.error('Departamento não encontrado.')
        } else {
          toast.error('Não foi possível carregar o departamento.')
        }
        navigate('/app/dados-mestres/departamento-denuncias', { replace: true })
      })
      .finally(() => setCarregandoDetalhe(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit, navigate])

  function closeForm() {
    if (presentation === 'modal') { navigate(-1); return }
    navigate('/app/dados-mestres/departamento-denuncias')
  }

  function onSubmit(values: DepartamentoFormValues) {
    const body = {
      name: values.nome.trim(),
      description: values.descricao.trim() || null,
      active: values.ativo,
    }
    void (async () => {
      try {
        if (isEdit && id) {
          await updateComplaintDepartment(id, body)
          toast.success('Departamento atualizado.', { description: body.name })
        } else {
          await createComplaintDepartment(body)
          toast.success('Departamento criado.', { description: body.name })
        }
        closeForm()
      } catch {
        toast.error(isEdit ? 'Não foi possível atualizar o departamento.' : 'Não foi possível criar o departamento.')
      }
    })()
  }

  if (isEdit && carregandoDetalhe) {
    return <div className="text-muted-foreground p-8 text-center text-sm">Carregando…</div>
  }

  return (
    <GenericCrudForm
      title={isEdit ? `Editar departamento — ${form.watch('nome') || '…'}` : 'Novo departamento de denúncia'}
      description="Departamentos responsáveis pelo tratamento das denúncias."
      headerIcon={BriefcaseBusiness}
      headerDescriptionIcon={FileText}
      submitLabel={isEdit ? 'Salvar alterações' : 'Criar departamento'}
      presentation={presentation}
      fieldColumns={presentation === 'modal' ? 2 : 3}
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      onCancel={closeForm}
    />
  )
}
