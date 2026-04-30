/** Texto visível a partir de HTML (validação de rich text sem DOM). */
export function textoPlanoDeHtml(html: string): string {
  if (!html.trim()) return ''
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
