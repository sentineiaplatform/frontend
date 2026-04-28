import { z } from 'zod'

/** Regex simples para formato de e-mail (alinhado ao comportamento esperado no login). */
const emailShape = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Validação do formulário de login (PT-BR). */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe o e-mail.')
    .regex(emailShape, 'Digite um e-mail válido.'),
  password: z
    .string()
    .min(1, 'Informe a senha.')
    .min(8, 'A senha deve ter no mínimo 8 caracteres.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
