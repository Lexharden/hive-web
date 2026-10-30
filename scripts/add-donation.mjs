// Registra, actualiza o quita a un donador en src/data/donors.json.
// La usa el workflow «Donación» con lo que manda n8n (Ko-fi automático o el formulario manual).
//
// Entrada: variable de entorno DONATION con un JSON:
//   {
//     action:  "registrar" (por defecto) | "actualizar" | "quitar",
//     id:      identificador único de la donación (evita duplicados si llega dos veces),
//     name:    nombre para el muro,
//     public:  true para mostrarlo; si es false, la donación cuenta pero no se publica nada,
//     tier:    "abeja" | "obrera" | "reina" (si falta: Ko-fi mensual = obrera; lo demás = abeja),
//     method:  "kofi" | "paypal" | "spei" | "otro",
//     amount, currency,                 // solo se usan si trackTotals está activo
//     tiktok, twitch, youtube, kick, instagram, x   // usuario o enlace al perfil (opcionales)
//   }
// Nunca se guardan montos por persona, correos ni mensajes.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { platforms, cleanHandle } from '../src/lib/socials.js';

const DONORS = new URL('../src/data/donors.json', import.meta.url);
const SUPPORT = new URL('../src/data/support.json', import.meta.url);

// Palabras que vuelven anónima una donación pública (Ko-fi publica el nombre que escriba cualquiera).
const BLOCKED = ['puta', 'puto', 'pendej', 'verga', 'chinga', 'mierda', 'culer', 'nigg', 'fuck', 'shit', 'nazi', 'hitler'];
const METHODS = ['kofi', 'paypal', 'spei', 'otro'];
const TIERS = ['abeja', 'obrera', 'reina'];
const YES = [true, 'true', 'si', 'sí', 'Si', 'Sí', 'yes'];

export function cleanName(raw) {
  let name = String(raw ?? '')
    .normalize('NFKC')
    .replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩]/g, '') // control y bidi
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (/https?:\/\/|www\.|\.(com|net|org|gg|ly|xyz)\b/i.test(name)) return null; // nada de enlaces
  if (BLOCKED.some((w) => name.toLowerCase().includes(w))) return null;
  name = name.replace(/^@+/, '');
  if (name.length > 32) name = name.slice(0, 31).trimEnd() + '…';
  return name.length >= 2 ? name : null;
}

export function hashId(id) {
  return createHash('sha256').update(String(id)).digest('hex').slice(0, 16);
}

function linksFrom(input) {
  const src = { ...(input.links ?? {}), ...input };
  const out = {};
  for (const p of Object.keys(platforms)) {
    const h = cleanHandle(p, src[p]);
    if (h) out[p] = h;
  }
  return out;
}

const rank = (t) => TIERS.indexOf(t);

export function applyDonation(donorsDoc, supportDoc, input, today = new Date()) {
  const doc = structuredClone(donorsDoc);
  doc.donors ??= [];
  doc.processed ??= [];
  doc.raisedMXN ??= 0;

  const action = ['actualizar', 'quitar'].includes(input.action) ? input.action : 'registrar';
  const name = cleanName(input.name);
  const findIdx = () => (name ? doc.donors.findIndex((d) => d.name.toLowerCase() === name.toLowerCase()) : -1);

  // Quitar del muro
  if (action === 'quitar') {
    const i = findIdx();
    if (i < 0) return { doc, changed: false, reason: 'no estaba en el muro', published: null };
    doc.donors.splice(i, 1);
    return { doc, changed: true, reason: 'quitado del muro', published: null };
  }

  const method = METHODS.includes(input.method) ? input.method : 'otro';
  const id = action === 'registrar' && input.id ? hashId(`${method}:${input.id}`) : null;
  if (id && doc.processed.includes(id)) return { doc, changed: false, reason: 'duplicada', published: null };

  const result = { doc, changed: false, reason: 'privada', published: null };

  if (action === 'registrar' && supportDoc.trackTotals) {
    const amount = Number(input.amount);
    if (Number.isFinite(amount) && amount > 0 && amount < 1_000_000) {
      const cur = String(input.currency || 'MXN').toUpperCase();
      const rate = cur === 'MXN' ? 1 : cur === 'USD' ? Number(supportDoc.usdToMxn) || 0 : 0;
      if (rate > 0) {
        doc.raisedMXN = Math.round((doc.raisedMXN + amount * rate) * 100) / 100;
        result.changed = true;
      }
    }
  }

  const wantsPublic = action === 'actualizar' || YES.includes(input.public);
  if (wantsPublic) {
    if (name) {
      const tier = TIERS.includes(input.tier) ? input.tier : input.source === 'kofi-mensual' ? 'obrera' : 'abeja';
      const links = linksFrom(input);
      const i = findIdx();
      if (i >= 0) {
        const d = doc.donors[i];
        const before = JSON.stringify(d);
        // El nivel solo sube con una donación nueva; «actualizar» puede ponerlo como sea.
        if (action === 'actualizar' ? TIERS.includes(input.tier) : rank(tier) > rank(d.tier ?? 'abeja')) d.tier = tier;
        if (Object.keys(links).length) d.links = { ...(d.links ?? {}), ...links };
        if (JSON.stringify(d) !== before) result.changed = true;
        result.reason = result.changed ? 'datos actualizados' : 'ya estaba en el muro';
      } else if (action === 'actualizar') {
        result.reason = 'no estaba en el muro';
      } else {
        const entry = { name, tier, since: today.toISOString().slice(0, 7) };
        if (Object.keys(links).length) entry.links = links;
        doc.donors.push(entry);
        result.changed = true;
        result.reason = 'publicada';
      }
      result.published = name;
    } else {
      result.reason = 'nombre no válido, se registró como anónima';
    }
  }

  if (id) {
    doc.processed.push(id);
    doc.processed = doc.processed.slice(-2000);
    result.changed = true;
  }
  return result;
}

// Ejecución desde el workflow
if (import.meta.url === `file://${process.argv[1]}`) {
  const raw = process.env.DONATION;
  if (!raw) throw new Error('Falta la variable DONATION');
  const input = JSON.parse(raw);
  const donorsDoc = JSON.parse(await readFile(DONORS, 'utf8'));
  const supportDoc = JSON.parse(await readFile(SUPPORT, 'utf8'));
  const { doc, changed, reason, published } = applyDonation(donorsDoc, supportDoc, input);
  if (changed) await writeFile(DONORS, JSON.stringify(doc, null, 2) + '\n');
  console.log(`${input.action ?? 'registrar'} (${input.method ?? 'otro'}): ${reason}${published ? ` (${published})` : ''}. Cambios: ${changed ? 'sí' : 'no'}`);
  if (process.env.GITHUB_OUTPUT) {
    await writeFile(process.env.GITHUB_OUTPUT, `changed=${changed}\npublished=${published ?? ''}\n`, { flag: 'a' });
  }
}
