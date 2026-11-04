// Eventos de GA4 y banner de consentimiento. Solo actúa si el layout cargó gtag
// (es decir, si PUBLIC_GA_ID es válido). Sin eso, este módulo no hace nada.
import { classifyLink, downloadParams } from '../lib/analytics';

const KEY = 'hive:consent';
const banner = document.querySelector<HTMLElement>('[data-consent]');

function track(name: string, params: Record<string, unknown> = {}) {
  window.gtag?.('event', name, params);
}

function stored(): 'granted' | 'denied' | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

function setConsent(value: 'granted' | 'denied') {
  try {
    localStorage.setItem(KEY, value);
  } catch {}
  window.gtag?.('consent', 'update', { analytics_storage: value });
  if (banner) banner.hidden = true;
}

if (window.gtag) {
  if (banner && stored() === null) banner.hidden = false;
  document.querySelector('[data-consent-accept]')?.addEventListener('click', () => setConsent('granted'));
  document.querySelector('[data-consent-reject]')?.addEventListener('click', () => setConsent('denied'));
  document.querySelector('[data-consent-open]')?.addEventListener('click', () => {
    if (banner) banner.hidden = false;
  });

  document.addEventListener('click', (ev) => {
    const el = ev.target as Element | null;
    if (!el) return;

    const dl = el.closest<HTMLAnchorElement>('a[data-download]');
    if (dl) {
      const panel = dl.closest<HTMLElement>('[data-dl]');
      track(
        'file_download',
        downloadParams({ href: dl.href, key: dl.dataset.key, app: panel?.dataset.app, tag: panel?.dataset.tag }),
      );
      return;
    }

    if (el.closest('button[data-copy]')) {
      track('copy_clabe');
      return;
    }

    const a = el.closest<HTMLAnchorElement>('a[href]');
    if (!a) return;
    const network = classifyLink(a.href, location.hostname);
    if (network) track('outbound_click', { network, link_url: a.href.slice(0, 200), page_path: location.pathname });
    else if (new URL(a.href, location.href).pathname.startsWith('/apoyar') && !location.pathname.startsWith('/apoyar')) {
      track('support_cta', { page_path: location.pathname });
    }
  });

  // El diálogo de agradecimiento se abre tras una descarga.
  const thanks = document.querySelector<HTMLDialogElement>('[data-thanks]');
  if (thanks) {
    new MutationObserver(() => {
      if (thanks.open) track('thanks_shown');
    }).observe(thanks, { attributes: true, attributeFilter: ['open'] });
  }
}
