// Redes que se pueden mostrar junto a cada donador.
// Se usa al registrar (validar y limpiar) y al pintar el muro (crear el enlace).
export const platforms = {
  tiktok: { label: 'TikTok', re: /^[A-Za-z0-9_.]{2,24}$/, url: (h) => `https://www.tiktok.com/@${h}`, hosts: ['tiktok.com'], at: true },
  twitch: { label: 'Twitch', re: /^[A-Za-z0-9_]{3,25}$/, url: (h) => `https://www.twitch.tv/${h}`, hosts: ['twitch.tv'] },
  youtube: { label: 'YouTube', re: /^[A-Za-z0-9_.-]{3,30}$/, url: (h) => `https://www.youtube.com/@${h}`, hosts: ['youtube.com'], at: true },
  kick: { label: 'Kick', re: /^[A-Za-z0-9_-]{3,25}$/, url: (h) => `https://kick.com/${h}`, hosts: ['kick.com'] },
  instagram: { label: 'Instagram', re: /^[A-Za-z0-9_.]{1,30}$/, url: (h) => `https://www.instagram.com/${h}`, hosts: ['instagram.com'], at: true },
  x: { label: 'X', re: /^[A-Za-z0-9_]{1,15}$/, url: (h) => `https://x.com/${h}`, hosts: ['x.com', 'twitter.com'], at: true },
};

/**
 * Acepta «usuario», «@usuario» o el enlace completo al perfil y devuelve solo el usuario.
 * Devuelve null si no es válido para esa red.
 */
export function cleanHandle(platform, raw) {
  const p = platforms[platform];
  if (!p || raw == null) return null;
  let v = String(raw).trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v) || /^(www\.)?[a-z]+\.(com|tv)\//i.test(v)) {
    try {
      const u = new URL(/^https?:/i.test(v) ? v : `https://${v}`);
      const host = u.hostname.replace(/^(www|m)\./, '');
      if (!p.hosts.includes(host)) return null;
      v = u.pathname.split('/').filter(Boolean)[0] ?? '';
    } catch {
      return null;
    }
  }
  v = v.replace(/^@+/, '');
  return p.re.test(v) ? v : null;
}

/** Texto visible del usuario: @usuario en las redes que lo usan. */
export function displayHandle(platform, handle) {
  return platforms[platform]?.at ? `@${handle}` : handle;
}
