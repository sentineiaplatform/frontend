import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { Clock, FileText, Tags, TextAlignStart, ToggleLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'

import {
  GenericCrudForm,
  type CrudFormField,
} from '@/components/forms/generic-crud-form'
import { textoPlanoDeHtml } from '@/lib/html-plain-text'
import {
  createComplaintCategory,
  fetchComplaintCategoryById,
  updateComplaintCategory,
} from '@/services/complaint-category-service'

const categoriaFormSchema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome da categoria.'),
  descricao: z
    .string()
    .refine((s) => textoPlanoDeHtml(s).length >= 5, {
      message: 'Inclua uma descrição mais completa (texto visível).',
    }),
  slaDias: z.number().int().min(0, 'O SLA não pode ser negativo.'),
  ativo: z.boolean(),
})

type CategoriaFormValues = z.infer<typeof categoriaFormSchema>

const defaultCategoriaValues: CategoriaFormValues = {
  nome: '',
  descricao: '',
  slaDias: 0,
  ativo: true,
}

const fields: CrudFormField<CategoriaFormValues>[] = [
  {
    type: 'text',
    name: 'nome',
    label: 'Nome',
    placeholder: 'Corrupção',
    icon: Tags,
  },
  {
    type: 'number',
    name: 'slaDias',
    label: 'SLA (dias)',
    min: 0,
    description: 'Use 0 para categoria sem prazo definido.',
    icon: Clock,
  },
  {
    type: 'textarea',
    name: 'descricao',
    label: 'Descrição',
    placeholder: 'Descreva os critérios dessa categoria.',
    icon: TextAlignStart,
  },
  {
    type: 'switch',
    name: 'ativo',
    label: 'Categoria ativa',
    description: 'Desative para manter apenas histórico.',
    icon: ToggleLeft,
    fullRow: true,
  },
]

export function CategoriaDenunciaFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()

  const modalParam = searchParams.get('modal')
  const presentation =
    modalParam === 'true' || modalParam === '1' ? 'modal' : 'page'
  const isEdit = Boolean(id)
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(isEdit)

  const form = useForm<CategoriaFormValues>({
    resolver: zodResolver(categoriaFormSchema),
    defaultValues: defaultCategoriaValues,
  })

  useEffect(() => {
    if (!isEdit || !id) {
      setCarregandoDetalhe(false)
      form.reset(defaultCategoriaValues)
      return
    }
    setCarregandoDetalhe(true)
    void fetchComplaintCategoryById(id)
      .then((dto) => {
        form.reset({
          nome: dto.name,
          descricao: dto.description ?? '',
          slaDias: dto.slaDays,
          ativo: dto.active,
        })
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.message === 'not_found') {
          toast.error('Categoria não encontrada.')
        } else {
          toast.error('Não foi possível carregar a categoria.')
        }
        navigate('/app/dados-mestres/categoria-denuncias', { replace: true })
      })
      .finally(() => setCarregandoDetalhe(false))
    // form.reset is stable from react-hook-form for this flow
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apenas id/isEdit disparam recarga
  }, [id, isEdit, navigate])

  function closeForm() {
    if (presentation === 'modal') {
      navigate(-1)
      return
    }
    navigate('/app/dados-mestres/categoria-denuncias')
  }

  function onSubmit(values: CategoriaFormValues) {
    const body = {
      name: values.nome.trim(),
      description: values.descricao.trim() || null,
      slaDays: values.slaDias,
      active: values.ativo,
    }
    void (async () => {
      try {
        if (isEdit && id) {
          await updateComplaintCategory(id, body)
          toast.success('Categoria atualizada.', {
            description: values.nome.trim(),
          })
        } else {
          await createComplaintCategory(body)
          toast.success('Categoria criada.', {
            description: values.nome.trim(),
          })
        }
        closeForm()
      } catch {
        toast.error(
          isEdit ? 'Não foi possível atualizar a categoria.' : 'Não foi possível criar a categoria.',
        )
      }
    })()
  }

  if (isEdit && carregandoDetalhe) {
    return (
      <div className="text-muted-foreground p-8 text-center text-sm">Carregando…</div>
    )
  }

  return (
    <GenericCrudForm
      title={
        isEdit ? `Editar categoria — ${form.watch('nome') || '…'}` : 'Nova categoria de denúncia'
      }
      description="Formulário genérico reutilizável com suporte a rota e modal."
      headerIcon={Tags}
      headerDescriptionIcon={FileText}
      submitLabel={isEdit ? 'Salvar alterações' : 'Criar categoria'}
      presentation={presentation}
      fieldColumns={presentation === 'modal' ? 2 : 3}
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      onCancel={closeForm}
    />
  )
}
