// Lógica pura de analítica (sin DOM), para poder probarla con `npm test`.

/** ID de medición de GA4, p. ej. G-ABC123XYZ9. */
export function isValidGaId(id: unknown): id is string {
  return typeof id === 'string' && /^G-[A-Z0-9]{6,12}$/.test(id.trim());
}

/** Devuelve el ID limpio o undefined. Sin ID válido, el sitio no carga nada de Google. */
export function cleanGaId(id: unknown): string | undefined {
  return isValidGaId(id) ? id.trim() : undefined;
}

export type Network = 'discord' | 'youtube' | 'instagram' | 'paypal' | 'kofi' | 'github' | 'other';

const NETWORKS: [Network, string[]][] = [
  ['discord', ['discord.gg', 'discord.com']],
  ['youtube', ['youtube.com', 'youtu.be']],
  ['instagram', ['instagram.com']],
  ['paypal', ['paypal.com', 'paypal.me']],
  ['kofi', ['ko-fi.com']],
  ['github', ['github.com', 'githubusercontent.com']],
];

/** Clasifica un enlace por su dominio. Devuelve null si es del propio sitio o no es una URL web. */
export function classifyLink(href: string, currentHost: string): Network | null {
  let url: URL;
  try {
    url = new URL(href, `https://${currentHost}`);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  const host = url.hostname.toLowerCase();
  if (host === currentHost.toLowerCase()) return null;
  for (const [name, domains] of NETWORKS) {
    if (domains.some((d) => host === d || host.endsWith(`.${d}`))) return name;
  }
  return 'other';
}

/** Parámetros del evento file_download a partir del nombre del archivo y los data-* del panel. */
export function downloadParams(opts: { href: string; key?: string; app?: string; tag?: string }) {
  let file = '';
  try {
    file = decodeURIComponent(new URL(opts.href, 'https://x.invalid').pathname.split('/').pop() ?? '');
  } catch {}
  return {
    file_name: file.slice(0, 100),
    file_extension: file.includes('.') ? file.split('.').pop()!.toLowerCase() : '',
    link_url: opts.href.slice(0, 200),
    app: (opts.app ?? '').slice(0, 40),
    version: (opts.tag ?? '').slice(0, 40),
    asset_key: (opts.key ?? '').slice(0, 60),
  };
}
