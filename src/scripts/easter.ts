// Easter eggs de la colmena. Nada de esto afecta el uso normal del sitio.
//   ↑ ↑ ↓ ↓ ← → ← → B A   enjambre de abejas y +30 vidas
//   iddqd                 modo dios
//   hesoyam               salud, armadura y dinero
//   idkfa                 todas las llaves (y todos los efectos)
//   5 clics en el logo     descarga eléctrica de HiveShock (en la portada)
//   clics en los logos de las apps: salen abejas; a la séptima, colmena enfadada
//   pausa (P) en la consola del inicio
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Avisos ----------
let toastBox: HTMLElement | null = null;
export function toast(title: string, text = '') {
  toastBox ??= Object.assign(document.body.appendChild(document.createElement('div')), {
    className: 'egg-toasts',
  });
  toastBox.setAttribute('role', 'status');
  toastBox.setAttribute('aria-live', 'polite');
  const el = document.createElement('div');
  el.className = 'egg-toast';
  const t = document.createElement('strong');
  t.textContent = title;
  el.append(t);
  if (text) {
    const p = document.createElement('span');
    p.textContent = text;
    el.append(p);
  }
  toastBox.append(el);
  setTimeout(() => el.classList.add('egg-toast--out'), 3600);
  setTimeout(() => el.remove(), 4100);
}

// ---------- Abejas ----------
const BEE =
  '<svg viewBox="0 0 48 40" aria-hidden="true"><ellipse cx="16" cy="9" rx="9" ry="7" fill="#f2f6fc" stroke="#06142b" stroke-width="2.5" opacity=".9"/><ellipse cx="28" cy="8" rx="8" ry="6.5" fill="#f2f6fc" stroke="#06142b" stroke-width="2.5" opacity=".9"/><ellipse cx="22" cy="24" rx="16" ry="11" fill="#fcca2f" stroke="#06142b" stroke-width="3"/><path d="M17 14v20M25 13.5v21" stroke="#06142b" stroke-width="4"/><circle cx="35" cy="21" r="2.2" fill="#06142b"/><path d="M6 24l-5 2" stroke="#06142b" stroke-width="3" stroke-linecap="round"/></svg>';

export function bee(fromX?: number, fromY?: number) {
  if (reduce) return;
  const b = document.createElement('span');
  b.className = 'egg-bee';
  b.innerHTML = BEE;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const x0 = fromX ?? (Math.random() < 0.5 ? -60 : w + 60);
  const y0 = fromY ?? Math.random() * h;
  const x1 = fromX != null ? x0 + (Math.random() - 0.5) * w * 1.4 : x0 < 0 ? w + 80 : -80;
  const y1 = fromY != null ? -80 : Math.random() * h;
  b.style.setProperty('--x0', `${x0}px`);
  b.style.setProperty('--y0', `${y0}px`);
  b.style.setProperty('--x1', `${x1}px`);
  b.style.setProperty('--y1', `${y1}px`);
  b.style.setProperty('--wob', `${10 + Math.random() * 30}px`);
  b.style.setProperty('--dur', `${2.2 + Math.random() * 2}s`);
  if (x1 < x0) b.classList.add('egg-bee--left');
  document.body.append(b);
  b.addEventListener('animationend', () => b.remove());
}

export function swarm(n = 24) {
  for (let i = 0; i < n; i++) setTimeout(() => bee(), i * 70);
}

// ---------- Descarga eléctrica ----------
export function shock() {
  if (!reduce) {
    document.documentElement.classList.add('egg-shock');
    setTimeout(() => document.documentElement.classList.remove('egg-shock'), 900);
  }
  toast('¡Shock!', 'Tu chat acaba de mandarte un rayo.');
}

// ---------- Códigos de teclado ----------
const konami = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
const words: Record<string, () => void> = {
  iddqd: () => {
    document.documentElement.classList.toggle('egg-god');
    toast('Modo dios', document.documentElement.classList.contains('egg-god') ? 'Ningún regalo puede tocarte.' : 'Vuelves a ser mortal.');
  },
  hesoyam: () => toast('Truco activado', 'Salud, armadura y $250 000. Las abejas no aceptan efectivo.'),
  idkfa: () => toast('Todas las llaves', 'Y todos los efectos de HiveShock, sin pagar nada.'),
};
let keys: string[] = [];
let typed = '';
window.addEventListener('keydown', (e) => {
  const t = e.target as HTMLElement;
  if (t.closest('input, textarea, [contenteditable]')) return;
  const k = e.key.toLowerCase();
  keys = [...keys, k].slice(-konami.length);
  if (keys.join() === konami.join()) {
    keys = [];
    swarm();
    toast('+30 vidas', 'Código Konami aceptado. La colmena te cubre.');
  }
  if (k.length === 1) {
    typed = (typed + k).slice(-12);
    for (const w of Object.keys(words)) {
      if (typed.endsWith(w)) {
        typed = '';
        words[w]();
      }
    }
  }
});

// ---------- Logo del encabezado ----------
const brand = document.querySelector<HTMLAnchorElement>('.brand');
let brandClicks = 0;
let brandTimer = 0;
brand?.addEventListener('click', (e) => {
  if (location.pathname !== '/') return; // en otras páginas el logo solo lleva al inicio
  e.preventDefault();
  brandClicks++;
  clearTimeout(brandTimer);
  brandTimer = window.setTimeout(() => (brandClicks = 0), 1200);
  brand.classList.remove('egg-zap');
  void brand.offsetWidth;
  brand.classList.add('egg-zap');
  if (brandClicks >= 5) {
    brandClicks = 0;
    shock();
  }
});

// ---------- Logos de las apps ----------
let logoClicks = 0;
document.querySelectorAll<HTMLElement>('[data-egg-hive]').forEach((logo) => {
  logo.style.cursor = 'pointer';
  logo.addEventListener('click', (e) => {
    const r = logo.getBoundingClientRect();
    bee(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2);
    logo.classList.remove('egg-wiggle');
    void logo.offsetWidth;
    logo.classList.add('egg-wiggle');
    logoClicks++;
    if (logoClicks === 7) {
      swarm(30);
      toast('¡Colmena enfadada!', 'Deja de picar el panal o te ganas un efecto.');
      if (logo.dataset.eggHive === 'hiveshock') shock();
      logoClicks = 0;
    }
  });
});

// ---------- Para quien abre la consola ----------
console.log(
  '%c⬢ Hive %c\n¿Abriste la consola? Ya eres de los nuestros.\nPrueba ↑ ↑ ↓ ↓ ← → ← → B A en cualquier página.\nReporta bugs en Discord y gánate el rol de tester.',
  'background:#fcca2f;color:#06142b;font:700 16px sans-serif;padding:4px 10px;border-radius:6px',
  'color:#a7bbd9;font:13px sans-serif',
);
