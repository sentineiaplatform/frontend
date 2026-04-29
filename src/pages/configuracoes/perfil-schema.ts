import { z } from 'zod'

export const perfilFormSchema = z.object({
  firstName: z.string().min(1, 'Informe o nome'),
  lastName: z.string().min(1, 'Informe o sobrenome'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(8, 'Telefone inválido'),
})

export type PerfilFormValues = z.infer<typeof perfilFormSchema>
