import { createBackendAuthService } from '@/services/auth/backend-auth-service'
import type { AuthService } from '@/services/auth/auth-service'

let singleton: AuthService | null = null

export function getAuthService(): AuthService {
  if (!singleton) {
    singleton = createBackendAuthService()
  }
  return singleton
}

export type { AuthService } from '@/services/auth/auth-service'
export type { LoginCredentials, LoginResult } from '@/services/auth/types'
export { AuthRequestError } from '@/services/auth/types'
