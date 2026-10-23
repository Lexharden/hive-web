import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

// Notas de versión: Markdown de GitHub → HTML limpio.
// Los enlaces externos se abren en otra pestaña y se quita todo lo que no sea contenido.
export function renderMarkdown(md: string): string {
  const html = marked.parse(md.trim(), { async: false, gfm: true, breaks: false }) as string;
  return sanitizeHtml(html, {
    allowedTags: ['h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'code', 'pre', 'a', 'blockquote', 'br', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    allowedAttributes: { a: ['href', 'target', 'rel'] },
    allowedSchemes: ['https', 'http'],
    transformTags: {
      h1: 'h3',
      h2: 'h3',
      h3: 'h4',
      a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener' }),
    },
  });
}
