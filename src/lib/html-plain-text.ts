function textoPlanoViaRegex(html: string): string {
  if (!html.trim()) return ''
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Texto visível a partir de HTML (DOMParser no browser; regex no SSR / fallback). */
export function plainTextFromHtml(html: string): string {
  const s = html ?? ''
  if (!s.trim()) return ''
  if (typeof document !== 'undefined') {
    try {
      const doc = new DOMParser().parseFromString(s, 'text/html')
      const text = doc.body?.textContent
      if (text != null && text.trim() !== '') {
        return text.replace(/\s+/g, ' ').trim()
      }
    } catch {
      /* fallback */
    }
  }
  return textoPlanoViaRegex(s)
}

/** @see plainTextFromHtml */
export function textoPlanoDeHtml(html: string): string {
  return plainTextFromHtml(html)
}
