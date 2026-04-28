import { z } from 'zod'

const emailShape = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Validação do cadastro (PT-BR). */
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Informe o nome.')
      .min(2, 'O nome deve ter pelo menos 2 caracteres.'),
    email: z
      .string()
      .min(1, 'Informe o e-mail.')
      .regex(emailShape, 'Digite um e-mail válido.'),
    password: z
      .string()
      .min(1, 'Informe a senha.')
      .min(8, 'A senha deve ter no mínimo 8 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirme a senha.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
