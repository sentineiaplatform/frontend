import { z } from 'zod'

export const perfilFormSchema = z.object({
  fullName: z.string().min(2, 'Informe o nome completo'),
  email: z.string().email('E-mail inválido'),
  perfilId: z.string().uuid('Selecione um perfil.'),
})

export type PerfilFormValues = z.infer<typeof perfilFormSchema>
