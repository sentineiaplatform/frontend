import { AuthRequestError } from '@/services/auth/types'

/** Mensagem quando o browser não consegue completar o pedido (servidor parado, CORS, offline, etc.). */
export const AUTH_MSG_SERVICO_INDISPONIVEL =
  'Não conseguimos ligar ao servidor. Verifique a sua ligação à internet e confirme que o serviço está em execução.'

function pareceErroDeRedeOuFetch(message: string): boolean {
  const m = message.toLowerCase()
  return (
    m.includes('failed to fetch') ||
    m.includes('networkerror') ||
    m.includes('network request failed') ||
    m.includes('load failed') ||
    m.includes('fetch') /* outros casos raros do motor */
  )
}

/** Converte erros técnicos em texto adequado ao utilizador (login / sessão). */
export function mapAuthErrorToUserMessage(error: unknown): string {
  if (error instanceof AuthRequestError) {
    if (error.status === 0) return AUTH_MSG_SERVICO_INDISPONIVEL
    return error.message
  }
  if (error instanceof TypeError && pareceErroDeRedeOuFetch(String(error.message))) {
    return AUTH_MSG_SERVICO_INDISPONIVEL
  }
  if (error instanceof Error && pareceErroDeRedeOuFetch(error.message)) {
    return AUTH_MSG_SERVICO_INDISPONIVEL
  }
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }
  return 'Não foi possível entrar. Tente novamente.'
}
