import { z } from 'zod'

export const geralFormSchema = z.object({
  organizationName: z.string().max(160, 'Máximo 160 caracteres'),
  locale: z.enum(['pt-BR', 'en-US']),
  dateFormat: z.enum(['dd/MM/yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy']),
  defaultTimezone: z.string().min(1, 'Selecione o fuso'),
  theme: z.enum(['light', 'dark', 'system']),
  uiZoom: z.enum(['90', '100', '110', '125']),
})

export type GeralFormValues = z.infer<typeof geralFormSchema>
