import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

// Notas de versión: Markdown del release → HTML limpio para la web.
// - Se quitan las líneas «Full Changelog» y los enlaces al repositorio (quedan como texto).
// - Los enlaces externos restantes se abren en otra pestaña.
export function renderMarkdown(md: string): string {
  const clean = md
    .replace(/^\s*\**\s*Full Changelog\s*\**\s*:.*$/gim, '')
    .replace(/^\s*\**\s*What's Changed\s*\**\s*$/gim, '')
    .replace(/\[([^\]]+)\]\(https?:\/\/github\.com[^)]*\)/gi, '$1')
    .replace(/<?https?:\/\/github\.com\/[^\s)>]+>?/gi, '')
    .trim();
  const html = marked.parse(clean, { async: false, gfm: true, breaks: false }) as string;
  return sanitizeHtml(html, {
    allowedTags: ['h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'code', 'pre', 'a', 'span', 'blockquote', 'br', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    allowedAttributes: { a: ['href', 'target', 'rel'] },
    allowedSchemes: ['https', 'http'],
    transformTags: {
      h1: 'h3',
      h2: 'h3',
      h3: 'h4',
      a: (tagName, attribs) =>
        /github\.com/i.test(attribs.href ?? '')
          ? { tagName: 'span', attribs: {} }
          : { tagName: 'a', attribs: { href: attribs.href, target: '_blank', rel: 'noopener' } },
    },
    exclusiveFilter: (frame) => frame.tag === 'p' && !frame.text.trim() && !frame.mediaChildren?.length,
  });
}
