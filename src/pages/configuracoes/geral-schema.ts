import { z } from 'zod'

export const geralFormSchema = z.object({
  organizationName: z.string().max(160, 'Máximo 160 caracteres'),
  locale: z.enum(['pt-BR', 'en-US']),
  dateFormat: z.enum(['dd/MM/yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy']),
  defaultTimezone: z.string().min(1, 'Selecione o fuso'),
})

export type GeralFormValues = z.infer<typeof geralFormSchema>
