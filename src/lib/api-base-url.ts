/** Base URL da API (Spring Boot). Defina `VITE_API_BASE_URL` no `.env` se não for localhost:8080. */
export function normalizeApiBaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, '')
  if (!trimmed) return 'http://localhost:8080'
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  // Sem protocolo o browser trata como path relativo (ex.: netlify.app/railway.app/...)
  return `https://${trimmed}`
}

/** Base URL da API (Spring Boot). Defina `VITE_API_BASE_URL` no `.env` se não for localhost:8080. */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return normalizeApiBaseUrl(raw)
  }
  return 'http://localhost:8080'
}
