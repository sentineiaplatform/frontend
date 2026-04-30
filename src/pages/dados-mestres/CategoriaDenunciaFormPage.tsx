import { useEffect, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { Clock, FileText, Hash, Tags, TextAlignStart, ToggleLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'

import {
  GenericCrudForm,
  type CrudFormField,
} from '@/components/forms/generic-crud-form'
import { textoPlanoDeHtml } from '@/lib/html-plain-text'
import { CATEGORIA_DENUNCIAS_MOCK } from '@/pages/dados-mestres/dados-mestres-mock'

const categoriaFormSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(2, 'Informe ao menos 2 caracteres.')
    .max(8, 'Use no máximo 8 caracteres.'),
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
  codigo: '',
  nome: '',
  descricao: '',
  slaDias: 0,
  ativo: true,
}

const fields: CrudFormField<CategoriaFormValues>[] = [
  { type: 'text', name: 'codigo', label: 'Código', placeholder: 'COR', icon: Hash },
  { type: 'text', name: 'nome', label: 'Nome', placeholder: 'Corrupção', icon: Tags },
  {
    type: 'number',
    name: 'slaDias',
    label: 'SLA (dias)',
    min: 0,
    description: 'Use 0 para categoria sem prazo definido.',
    icon: Clock,
  },
  {
    type: 'richtext',
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
  const current = useMemo(
    () => CATEGORIA_DENUNCIAS_MOCK.find((item) => item.id === id),
    [id],
  )

  const defaultValues = useMemo<CategoriaFormValues>(() => {
    if (!current) return defaultCategoriaValues
    return {
      codigo: current.codigo,
      nome: current.nome,
      descricao: current.descricao,
      slaDias: current.slaDias,
      ativo: current.ativo,
    }
  }, [current])

  const form = useForm<CategoriaFormValues>({
    resolver: zodResolver(categoriaFormSchema),
    defaultValues,
  })

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  useEffect(() => {
    if (!isEdit) return
    if (current) return
    toast.error('Categoria não encontrada.')
    navigate('/app/dados-mestres/categoria-denuncias', { replace: true })
  }, [current, isEdit, navigate])

  function closeForm() {
    if (presentation === 'modal') {
      navigate(-1)
      return
    }
    navigate('/app/dados-mestres/categoria-denuncias')
  }

  function onSubmit(values: CategoriaFormValues) {
    toast.success(isEdit ? 'Categoria atualizada (mock).' : 'Categoria criada (mock).', {
      description: `${values.codigo} · ${values.nome}`,
    })
    closeForm()
  }

  if (isEdit && !current) return null

  return (
    <GenericCrudForm
      title={isEdit ? `Editar categoria ${current?.codigo ?? ''}` : 'Nova categoria de denúncia'}
      description="Formulário genérico reutilizável com suporte a rota e modal."
      headerIcon={Tags}
      headerDescriptionIcon={FileText}
      submitLabel={isEdit ? 'Salvar alterações' : 'Criar categoria'}
      presentation={presentation}
      fieldColumns={3}
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      onCancel={closeForm}
    />
  )
}
