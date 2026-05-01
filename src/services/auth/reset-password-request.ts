import { getApiBaseUrl } from '@/lib/api-base-url'

export async function requestResetPassword(token: string, newPassword: string): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/reset-password`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: token.trim(),
      newPassword,
    }),
  })

  if (res.status === 204 || res.status === 200) {
    return
  }

  let detail = 'Não foi possível redefinir a senha.'
  try {
    const data = (await res.json()) as { error?: string; message?: string }
    if (typeof data.error === 'string') detail = data.error
    else if (typeof data.message === 'string') detail = data.message
  } catch {
    /* ignore */
  }
  throw new Error(detail)
}
