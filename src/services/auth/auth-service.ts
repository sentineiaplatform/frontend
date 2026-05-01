import type { LoginCredentials, LoginResult } from '@/services/auth/types'

export type LoginOptions = {
  /** Se verdadeiro, persiste o token em `localStorage`; caso contrário `sessionStorage`. */
  remember?: boolean
}

/**
 * Contrato genérico de autenticação (implementação HTTP, mock de testes, etc.).
 */
export type AuthService = {
  login(credentials: LoginCredentials, options?: LoginOptions): Promise<LoginResult>
  /** Revoga o token no servidor (se suportado) e limpa o armazenamento local. */
  logout(): Promise<void>
}
