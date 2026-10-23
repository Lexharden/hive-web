// Dos tareas en el navegador:
// 1. Elegir el botón principal según el sistema de quien visita.
// 2. Preguntar a GitHub si hay un release más nuevo que el del último build y,
//    si lo hay, actualizar versión, fecha y enlaces sin esperar al redeploy.
import { classify, formatDate, formatSize, type Platform } from '../lib/assets';

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  const uaPlatform = (navigator as any).userAgentData?.platform as string | undefined;
  const p = (uaPlatform || navigator.platform || '').toLowerCase();
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'macos'; // sin versión iOS: se muestra el aviso
  if (p.includes('mac') || /mac os x/i.test(ua)) return 'macos';
  if (p.includes('linux') || /linux|x11/i.test(ua)) return 'linux';
  return 'windows';
}

function pickPrimary(panel: HTMLElement, platform: Platform) {
  const items = panel.querySelectorAll<HTMLElement>('[data-primary]');
  const match = panel.querySelector<HTMLElement>(`[data-primary="${platform}"]`);
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (!match || isIOS) {
    // Sin versión para este dispositivo: se deja la de Windows y se avisa.
    if (platform === 'android' || isIOS) panel.querySelector<HTMLElement>('[data-unsupported]')!.hidden = false;
    return;
  }
  items.forEach((el) => (el.hidden = el !== match));
}

interface ApiRelease {
  tag_name: string;
  published_at: string;
  html_url: string;
  assets: Array<{ name: string; browser_download_url: string; size: number; download_count: number }>;
}

async function latestFor(repo: string): Promise<ApiRelease | null> {
  const key = `hive:latest:${repo}`;
  try {
    const cached = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (cached && Date.now() - cached.at < 10 * 60 * 1000) return cached.data;
  } catch {}
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as ApiRelease;
    try {
      sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
    } catch {}
    return data;
  } catch {
    return null;
  }
}

async function refresh(panel: HTMLElement) {
  const repo = panel.dataset.repo!;
  const rel = await latestFor(repo);
  if (!rel || rel.tag_name === panel.dataset.tag) return;
  if (new Date(rel.published_at) < new Date(panel.dataset.published || 0)) return;

  const byKey = new Map(rel.assets.map(classify).map((a) => [a.key, a]));
  panel.querySelectorAll<HTMLAnchorElement>('a[data-key]').forEach((link) => {
    const a = byKey.get(link.dataset.key!);
    const row = link.closest('li') ?? link.closest('[data-primary]') ?? link;
    if (!a) {
      (row as HTMLElement).hidden = true;
      return;
    }
    link.href = a.url;
    const size = row.querySelector<HTMLElement>('[data-size]');
    if (size) size.textContent = formatSize(a.size);
  });
  panel.querySelectorAll<HTMLElement>('[data-version]').forEach((el) => (el.textContent = rel.tag_name.startsWith('v') ? rel.tag_name : `v${rel.tag_name}`));
  panel.querySelectorAll<HTMLElement>('[data-date]').forEach((el) => (el.textContent = formatDate(rel.published_at)));
  panel.querySelectorAll<HTMLAnchorElement>('[data-release-link]').forEach((el) => (el.href = rel.html_url));
  const fresh = panel.querySelector<HTMLElement>('[data-fresh]');
  if (fresh) fresh.hidden = false;
  panel.dataset.tag = rel.tag_name;

  // Otros lugares de la página que muestran la versión de este repo.
  document.querySelectorAll<HTMLElement>(`[data-version-of="${repo}"]`).forEach((el) => {
    el.textContent = rel.tag_name.startsWith('v') ? rel.tag_name : `v${rel.tag_name}`;
  });
}

const platform = detectPlatform();
document.querySelectorAll<HTMLElement>('[data-dl]').forEach((panel) => {
  pickPrimary(panel, platform);
  refresh(panel);
});
document.documentElement.dataset.platform = platform;

// Versiones sueltas (tarjetas, cabeceras) de repos sin panel de descarga en esta página.
const withPanel = new Set([...document.querySelectorAll<HTMLElement>('[data-dl]')].map((p) => p.dataset.repo));
const loose = new Set(
  [...document.querySelectorAll<HTMLElement>('[data-version-of]')].map((el) => el.dataset.versionOf!).filter((r) => !withPanel.has(r)),
);
loose.forEach(async (repo) => {
  const rel = await latestFor(repo);
  if (!rel) return;
  document.querySelectorAll<HTMLElement>(`[data-version-of="${repo}"]`).forEach((el) => {
    if (el.dataset.tag && el.dataset.tag !== rel.tag_name && rel.published_at > (el.dataset.published || '')) {
      el.textContent = rel.tag_name.startsWith('v') ? rel.tag_name : `v${rel.tag_name}`;
    }
  });
});
