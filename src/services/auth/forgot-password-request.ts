import { getApiBaseUrl } from '@/lib/api-base-url'

/**
 * Solicita e-mail de recuperação (`POST /api/auth/forgot-password`).
 * Não envia credenciais; a API responde sempre de forma neutra.
 */
export async function requestForgotPassword(email: string): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/forgot-password`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  })

  if (res.status === 202 || res.status === 204) {
    return
  }

  let detail = 'Não foi possível enviar o pedido. Tente mais tarde.'
  try {
    const data = (await res.json()) as { message?: string; error?: string }
    if (typeof data.message === 'string') detail = data.message
    else if (typeof data.error === 'string') detail = data.error
  } catch {
    /* ignore */
  }
  throw new Error(detail)
}
