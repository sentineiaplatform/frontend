import { z } from 'zod'

const emailShape = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe o e-mail.')
    .regex(emailShape, 'Digite um e-mail válido.'),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
