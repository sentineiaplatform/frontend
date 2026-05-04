import { zodResolver } from '@hookform/resolvers/zod'
import {
  BriefcaseBusiness,
  Calendar,
  CircleDot,
  FileText,
  Gauge,
  Hash,
  MessageSquare,
  PhoneCall,
  ShieldAlert,
  Tags,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { toast } from 'sonner'

import {
  GenericCrudForm,
  type CrudFormField,
} from '@/components/forms/generic-crud-form'
import {
  DENUNCIA_CANAIS_MOCK,
  DENUNCIA_DEPARTAMENTOS_MOCK,
  DENUNCIA_PRIORIDADE_FORM,
  DENUNCIA_STATUS_FORM,
} from '@/pages/denuncias/denuncias-mock'

function defaultDatetimeLocal(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

const canalEnum = z.enum(DENUNCIA_CANAIS_MOCK)
const departamentoEnum = z.enum(DENUNCIA_DEPARTAMENTOS_MOCK)

const novaDenunciaSchema = z.object({
  protocolo: z.string(),
  registradoEm: z.string().min(1, 'Informe data e hora de registro.'),
  categoria: z.string().trim().min(2, 'Informe a categoria.'),
  canal: canalEnum,
  status: z.enum(['aberta', 'em_analise', 'encerrada']),
  prioridade: z.enum(['P1', 'P2', 'P3']),
  departamento: departamentoEnum,
  resumo: z.string().trim().min(20, 'Descreva o fato com um pouco mais de detalhe.'),
})

type NovaDenunciaValues = z.infer<typeof novaDenunciaSchema>

const defaultValues: NovaDenunciaValues = {
  protocolo: '',
  registradoEm: defaultDatetimeLocal(),
  categoria: '',
  canal: 'Canal web',
  status: 'aberta',
  prioridade: 'P2',
  departamento: DENUNCIA_DEPARTAMENTOS_MOCK[0],
  resumo: '',
}

const fields: CrudFormField<NovaDenunciaValues>[] = [
  {
    type: 'text',
    name: 'protocolo',
    label: 'Protocolo',
    description: 'Na listagem, o protocolo é gerado ao concluir o registro (ex.: DEN-2026-00xxx).',
    placeholder: 'Ex.: DEN-2026-00xxx (ao salvar)',
    icon: Hash,
    readOnly: true,
  },
  {
    type: 'datetime-local-picker',
    name: 'registradoEm',
    label: 'Data',
    description: 'Equivale à coluna “Data” (registrado em) na tabela.',
    icon: Calendar,
  },
  { type: 'text', name: 'categoria', label: 'Categoria', placeholder: 'Ex.: Assédio moral', icon: Tags },
  {
    type: 'select',
    name: 'canal',
    label: 'Canal',
    placeholder: 'Selecione',
    icon: PhoneCall,
    options: DENUNCIA_CANAIS_MOCK.map((v) => ({ value: v, label: v })),
  },
  {
    type: 'select',
    name: 'status',
    label: 'Status',
    placeholder: 'Selecione',
    icon: CircleDot,
    options: DENUNCIA_STATUS_FORM,
  },
  {
    type: 'select',
    name: 'prioridade',
    label: 'Prioridade',
    placeholder: 'Selecione',
    icon: Gauge,
    options: DENUNCIA_PRIORIDADE_FORM,
  },
  {
    type: 'select',
    name: 'departamento',
    label: 'Departamento',
    placeholder: 'Selecione',
    icon: BriefcaseBusiness,
    options: DENUNCIA_DEPARTAMENTOS_MOCK.map((v) => ({ value: v, label: v })),
  },
  {
    type: 'textarea',
    name: 'resumo',
    label: 'Relato / detalhes',
    description: 'Texto livre para triagem (não aparece como coluna na tabela).',
    placeholder: 'Descreva o que ocorreu, com contexto e datas se souber.',
    icon: MessageSquare,
    fullRow: true,
  },
]

/** Cadastro de nova denúncia em página — campos alinhados às colunas da listagem. */
export function DenunciaNovaPage() {
  const navigate = useNavigate()
  const form = useForm<NovaDenunciaValues>({
    resolver: zodResolver(novaDenunciaSchema),
    defaultValues,
  })

  function voltar() {
    navigate('/app/denuncias')
  }

  function onSubmit(values: NovaDenunciaValues) {
    const protocoloMock = `DEN-2026-${String(40_000 + Math.floor(Math.random() * 500)).slice(-5)}`
    toast.success('Denúncia registrada (mock).', {
      description: `${protocoloMock} · ${values.categoria} · ${values.canal} · ${values.status.toUpperCase()}`,
    })
    voltar()
  }

  return (
    <GenericCrudForm
      title="Nova denúncia"
      description="Campos espelhando a tabela principal (protocolo e “Atualizado” seguem regras automáticas após o envio)."
      headerIcon={ShieldAlert}
      headerDescriptionIcon={FileText}
      submitLabel="Registrar denúncia"
      presentation="page"
      fieldColumns={2}
      form={form}
      fields={fields}
      onSubmit={onSubmit}
      onCancel={voltar}
    />
  )
}
