// Al pulsar una descarga, la descarga empieza normal y se abre un agradecimiento
// con la invitación a apoyar. Como mucho una vez cada 10 minutos por visitante.
const dialog = document.querySelector<HTMLDialogElement>('[data-thanks]');
const KEY = 'hive:thanks-at';

function recentlyShown(): boolean {
  try {
    return Date.now() - Number(sessionStorage.getItem(KEY) || 0) < 10 * 60 * 1000;
  } catch {
    return false;
  }
}

document.addEventListener('click', (ev) => {
  const link = (ev.target as Element).closest<HTMLAnchorElement>('a[data-download]');
  if (!link || !dialog || recentlyShown()) return;
  const panel = link.closest<HTMLElement>('[data-dl]');
  const app = dialog.querySelector('[data-thanks-app]');
  if (app) app.textContent = panel?.dataset.app ?? 'la app';
  // Se deja correr la descarga y se abre el diálogo en el siguiente ciclo.
  setTimeout(() => {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    try {
      sessionStorage.setItem(KEY, String(Date.now()));
    } catch {}
  }, 150);
});

dialog?.addEventListener('click', (ev) => {
  if (ev.target === dialog) dialog.close(); // clic fuera del cuadro
});

// Botones «Copiar CLABE». Si el portapapeles no está disponible, se selecciona el número.
document.addEventListener('click', async (ev) => {
  const btn = (ev.target as Element).closest<HTMLButtonElement>('button[data-copy]');
  if (!btn) return;
  const text = btn.dataset.copy!;
  const label = (btn.dataset.label ??= btn.textContent ?? '');
  try {
    await navigator.clipboard.writeText(text);
    btn.dataset.copied = '';
    btn.textContent = 'Copiada';
  } catch {
    const target = document.getElementById(btn.dataset.copyTarget || '');
    if (target) {
      const range = document.createRange();
      range.selectNodeContents(target);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
    btn.textContent = 'Selecciónala y cópiala';
  }
  setTimeout(() => {
    delete btn.dataset.copied;
    btn.textContent = label;
  }, 2200);
});
