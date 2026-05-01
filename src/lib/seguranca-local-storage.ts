/** Senha simulada neste navegador (sem API). Primeiro acesso: compare com `SENHA_ATUAL_PADRAO`. */
export const SENHA_LOCAL_STORAGE_KEY = 'sentineia:senhaLocalDemo'
export const SENHA_ATUAL_PADRAO = 'senha1234'

export function lerSenhaArmazenadaLocal(): string {
  try {
    return localStorage.getItem(SENHA_LOCAL_STORAGE_KEY) ?? SENHA_ATUAL_PADRAO
  } catch {
    return SENHA_ATUAL_PADRAO
  }
}

export function gravarSenhaLocal(senha: string) {
  try {
    localStorage.setItem(SENHA_LOCAL_STORAGE_KEY, senha)
  } catch {
    throw new Error('storage')
  }
}
