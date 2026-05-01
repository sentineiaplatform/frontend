/** Base URL da API (Spring Boot). Defina `VITE_API_BASE_URL` no `.env` se não for localhost:8080. */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.replace(/\/$/, '')
  }
  return 'http://localhost:8080'
}
