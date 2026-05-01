import { z } from 'zod'

export const segurancaSenhaSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual.'),
    newPassword: z
      .string()
      .min(1, 'Informe a nova senha.')
      .min(8, 'A nova senha deve ter no mínimo 8 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'A nova senha deve ser diferente da atual.',
    path: ['newPassword'],
  })

export type SegurancaSenhaValues = z.infer<typeof segurancaSenhaSchema>
