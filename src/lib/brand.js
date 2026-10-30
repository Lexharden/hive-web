// Marca de Hive: logo e insignias de nivel, como SVG en texto.
// Se usa en los componentes de la web y en scripts/export-brand.mjs para generar los archivos de /public/brand.
// Estilo tomado de los logos de HiveShock y HiveBuzz: panal mitad azul y mitad miel, contorno grueso de tinta y abejas.

export const C = {
  ink: '#06142b',
  navy: '#16437d',
  navyLine: '#2c62a6',
  honey: '#fcca2f',
  honeyLine: '#dca516',
  ember: '#cf4c28',
  emberDark: '#a63a1c',
  silver: '#d3deee',
  silverLine: '#9fb2cf',
  paper: '#f6f9fd',
};

const hexPts = (cx, cy, r) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = ((60 * i - 90) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');

/** Rejilla de panal (líneas) para rellenar un área. */
function combLines(x0, y0, x1, y1, r, color, width) {
  const w = Math.sqrt(3) * r;
  let d = '';
  for (let row = 0, y = y0; y < y1 + r; row++, y += r * 1.5) {
    for (let x = x0 + (row % 2 ? w / 2 : 0); x < x1 + w; x += w) {
      const p = Array.from({ length: 6 }, (_, i) => {
        const a = ((60 * i - 90) * Math.PI) / 180;
        return `${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`;
      });
      d += `M${p[0]}L${p.slice(1).join('L')}Z`;
    }
  }
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
}

/**
 * Abeja de caricatura mirando a la derecha, centrada en (0,0), unos 44×36 de tamaño.
 * opts.crown: corona de reina. opts.drop: lleva una gota de miel.
 */
export function bee(uid, opts = {}) {
  const { crown = false, drop = false } = opts;
  const id = `bb-${uid}`;
  return `
  <g>
    <ellipse cx="-6" cy="-12" rx="7.5" ry="10.5" transform="rotate(-24 -6 -12)" fill="${C.paper}" stroke="${C.ink}" stroke-width="2.6"/>
    <ellipse cx="5" cy="-13.5" rx="7.5" ry="10.5" transform="rotate(22 5 -13.5)" fill="${C.paper}" stroke="${C.ink}" stroke-width="2.6"/>
    <path d="M-15.5 1.5 L-22 3.2 L-15.6 5.6 Z" fill="${C.ink}" stroke="${C.ink}" stroke-width="1.5" stroke-linejoin="round"/>
    <clipPath id="${id}"><ellipse cx="0" cy="2" rx="15" ry="11"/></clipPath>
    <ellipse cx="0" cy="2" rx="15" ry="11" fill="${C.honey}"/>
    <g clip-path="url(#${id})" fill="${C.ink}">
      <rect x="-8.5" y="-10" width="4.6" height="24"/>
      <rect x="0" y="-10" width="4.6" height="24"/>
    </g>
    <ellipse cx="0" cy="2" rx="15" ry="11" fill="none" stroke="${C.ink}" stroke-width="3"/>
    ${crown ? '' : `<path d="M14 -6 q1.5 -7 6.5 -9.5 M18 -4 q4.5 -5 9.5 -5" fill="none" stroke="${C.ink}" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="20.5" cy="-15.5" r="2.1" fill="${C.ink}"/><circle cx="27.5" cy="-9" r="2.1" fill="${C.ink}"/>`}
    <circle cx="17" cy="1" r="7.6" fill="${C.ink}"/>
    <circle cx="19.6" cy="-0.6" r="2.4" fill="${C.paper}"/>
    <circle cx="20.2" cy="-1" r="1" fill="${C.ink}"/>
    ${drop ? `<path d="M2 14 C2 14 -4 21 -4 25 a6 6 0 0 0 12 0 C8 21 2 14 2 14 Z" fill="${C.honey}" stroke="${C.ink}" stroke-width="2.4" stroke-linejoin="round"/><path d="M0 23.5 a2.4 2.4 0 0 0 1.6 2.6" fill="none" stroke="${C.paper}" stroke-width="1.6" stroke-linecap="round"/>` : ''}
    ${crown ? `<path d="M8.5 -5 L8 -18.5 L12.8 -12 L17 -22 L21.2 -12 L26 -18.5 L25.5 -5 Z" fill="${C.honey}" stroke="${C.ink}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="17" cy="-9" r="2" fill="${C.ember}" stroke="${C.ink}" stroke-width="1.2"/><circle cx="8" cy="-19" r="1.6" fill="${C.honey}" stroke="${C.ink}" stroke-width="1.2"/><circle cx="17" cy="-22.5" r="1.6" fill="${C.honey}" stroke="${C.ink}" stroke-width="1.2"/><circle cx="26" cy="-19" r="1.6" fill="${C.honey}" stroke="${C.ink}" stroke-width="1.2"/>` : ''}
  </g>`;
}

/** Logo de Hive: celda de panal partida por un zigzag (azul y miel) con una abeja saliendo. viewBox 0 0 132 132. */
export function hiveMark(uid = 'm') {
  const L = `hl-${uid}`;
  const R = `hr-${uid}`;
  const left = '66,8 56,62 76,68 66,124 15.8,95 15.8,37';
  const right = '66,8 116.2,37 116.2,95 66,124 76,68 56,62';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132 132" role="img" aria-label="Hive">
  <defs>
    <clipPath id="${L}"><polygon points="${left}"/></clipPath>
    <clipPath id="${R}"><polygon points="${right}"/></clipPath>
  </defs>
  <polygon points="${hexPts(70, 70, 58)}" fill="${C.ink}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
  <polygon points="${left}" fill="${C.navy}"/>
  <g clip-path="url(#${L})">${combLines(0, 0, 132, 132, 9, C.navyLine, 2.2)}</g>
  <polygon points="${right}" fill="${C.honey}"/>
  <g clip-path="url(#${R})">${combLines(0, 0, 132, 132, 9, C.honeyLine, 2.2)}</g>
  <polyline points="66,8 56,62 76,68 66,124" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
  <polygon points="${hexPts(66, 66, 58)}" fill="none" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
  <path d="M30 86 C40 70 58 74 70 56 S92 34 98 30" fill="none" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="0.5 6.5" opacity=".8"/>
  <g transform="translate(101 28) rotate(-14) scale(0.9)">${bee(uid)}</g>
</svg>`;
}

export const tiers = {
  abeja: { name: 'Abeja', rim: C.ember, rimLine: C.emberDark },
  obrera: { name: 'Obrera', rim: C.silver, rimLine: C.silverLine },
  reina: { name: 'Reina', rim: C.honey, rimLine: C.honeyLine },
};

/** Insignia de nivel: hexágono con aro de color (cobre, plata u oro) y la abeja del nivel. viewBox 0 0 120 128. */
export function tierBadge(tier, uid = 't') {
  const t = tiers[tier] ?? tiers.abeja;
  const cx = 60;
  const cy = 66;
  const clip = `tb-${tier}-${uid}`;
  const rays =
    tier === 'reina'
      ? Array.from({ length: 12 }, (_, i) => {
          const a1 = ((30 * i - 90 - 7) * Math.PI) / 180;
          const a2 = ((30 * i - 90 + 7) * Math.PI) / 180;
          const am = ((30 * i - 90) * Math.PI) / 180;
          const r0 = 44;
          const r1 = i % 2 ? 57 : 62;
          return `<polygon points="${cx + r0 * Math.cos(a1)},${cy + r0 * Math.sin(a1)} ${cx + r1 * Math.cos(am)},${cy + r1 * Math.sin(am)} ${cx + r0 * Math.cos(a2)},${cy + r0 * Math.sin(a2)}" fill="${i % 2 ? C.ember : C.honey}" stroke="${C.ink}" stroke-width="2.4" stroke-linejoin="round"/>`;
        }).join('')
      : '';
  const cells = '';
  const trail =
    tier === 'abeja'
      ? `<path d="M28 90 C34 82 34 76 40 72" fill="none" stroke="${C.paper}" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="0.5 6" opacity=".85"/>`
      : '';
  const beePos = tier === 'obrera' ? 'translate(57 58) scale(0.95)' : tier === 'reina' ? 'translate(56 72) scale(1)' : 'translate(57 70) scale(1)';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 128" role="img" aria-label="Nivel ${t.name}">
  <defs><clipPath id="${clip}"><polygon points="${hexPts(cx, cy, 36)}"/></clipPath></defs>
  ${rays}
  <polygon points="${hexPts(cx + 3, cy + 4, 47)}" fill="${C.ink}"/>
  <polygon points="${hexPts(cx, cy, 47)}" fill="${t.rim}" stroke="${C.ink}" stroke-width="4" stroke-linejoin="round"/>
  ${tier === 'reina' ? `<polygon points="${hexPts(cx, cy, 41.5)}" fill="none" stroke="${C.ink}" stroke-width="2" stroke-linejoin="round" opacity=".55"/>` : ''}
  <polygon points="${hexPts(cx, cy, 36)}" fill="${C.navy}" stroke="${C.ink}" stroke-width="3.2" stroke-linejoin="round"/>
  <g clip-path="url(#${clip})">${combLines(10, 16, 110, 116, 7, C.navyLine, 1.8)}</g>
  <polygon points="${hexPts(cx, cy, 36)}" fill="none" stroke="${C.ink}" stroke-width="3.2" stroke-linejoin="round"/>
  ${trail}${cells}
  <g transform="${beePos}">${bee(`${tier}-${uid}`, { crown: tier === 'reina', drop: tier === 'obrera' })}</g>
  <path d="M${cx - 30} ${cy - 22} l6 -3.5" stroke="${C.paper}" stroke-width="3" stroke-linecap="round" opacity=".45"/>
</svg>`;
}
