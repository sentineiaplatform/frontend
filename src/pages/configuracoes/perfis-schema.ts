import { z } from 'zod'

export const perfilCreateSchema = z.object({
  nome: z.string().trim().min(2, 'Nome com pelo menos 2 caracteres.').max(80),
  descricao: z.string().trim().max(500),
})

export type PerfilCreateValues = z.infer<typeof perfilCreateSchema>
