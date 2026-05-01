export type LoginCredentials = {
  email: string
  password: string
}

export type LoginResult = {
  accessToken: string
  tokenType: string
  expiresInMs: number
  /** Igual ao claim `name` do JWT (`users.name`). */
  name?: string
  email?: string
}

export class AuthRequestError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AuthRequestError'
    this.status = status
  }
}
