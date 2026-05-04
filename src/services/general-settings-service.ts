import { authorizedFetch } from '@/lib/api-client'
import { AUTH_MSG_SERVICO_INDISPONIVEL } from '@/services/auth/map-auth-error'
import { AuthRequestError } from '@/services/auth/types'
import type { GeralFormValues } from '@/pages/configuracoes/geral-schema'

export type GeneralDto = {
  id: string
  organizationName: string
  locale: string
  dateFormat: string
  defaultTimezone: string
  theme: string
  uiZoom: string
  updatedAt: string
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string; message?: string; detail?: string }
    if (typeof data.error === 'string') return data.error
    if (typeof data.message === 'string') return data.message
    if (typeof data.detail === 'string') return data.detail
  } catch {
    /* ignore */
  }
  if (res.status === 400) return 'Dados inválidos.'
  return `Erro ${res.status}`
}

export async function fetchGeneralSettings(): Promise<GeneralDto> {
  let res: Response
  try {
    res = await authorizedFetch('/api/general', {
      headers: { Accept: 'application/json' },
    })
  } catch {
    throw new AuthRequestError(AUTH_MSG_SERVICO_INDISPONIVEL, 0)
  }
  if (!res.ok) {
    throw new AuthRequestError(await parseErrorMessage(res), res.status)
  }
  return res.json() as Promise<GeneralDto>
}

export async function patchGeneralSettings(body: GeralFormValues): Promise<GeneralDto> {
  const payload = {
    organizationName: body.organizationName.trim(),
    locale: body.locale,
    dateFormat: body.dateFormat,
    defaultTimezone: body.defaultTimezone,
    theme: body.theme,
    uiZoom: body.uiZoom,
  }
  let res: Response
  try {
    res = await authorizedFetch('/api/general', {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new AuthRequestError(AUTH_MSG_SERVICO_INDISPONIVEL, 0)
  }
  if (!res.ok) {
    throw new AuthRequestError(await parseErrorMessage(res), res.status)
  }
  return res.json() as Promise<GeneralDto>
}

export function geralFormFromDto(d: GeneralDto): GeralFormValues {
  return {
    organizationName: d.organizationName,
    locale: d.locale as GeralFormValues['locale'],
    dateFormat: d.dateFormat as GeralFormValues['dateFormat'],
    defaultTimezone: d.defaultTimezone,
    theme: d.theme as GeralFormValues['theme'],
    uiZoom: d.uiZoom as GeralFormValues['uiZoom'],
  }
}
