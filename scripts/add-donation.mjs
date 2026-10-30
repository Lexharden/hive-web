// Registra una donación en src/data/donors.json.
// La usa el workflow «Donación» con lo que manda n8n (Ko-fi automático o el formulario manual).
//
// Entrada: variable de entorno DONATION con un JSON:
//   { id, name, method, amount, currency, public, source }
//   - id: identificador único (Ko-fi lo trae; en el formulario se genera). Evita duplicados si llega dos veces.
//   - public: solo si es true se publica el nombre.
// Nunca se guardan montos por persona, correos ni mensajes. Si support.json tiene trackTotals: true,
// el monto se suma a un total general (raisedMXN) para las barras de metas.
//
// Para borrar o renombrar a alguien, edita donors.json a mano.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const DONORS = new URL('../src/data/donors.json', import.meta.url);
const SUPPORT = new URL('../src/data/support.json', import.meta.url);

// Palabras que vuelven anónima una donación pública (Ko-fi publica el nombre que escriba cualquiera).
const BLOCKED = ['puta', 'puto', 'pendej', 'verga', 'chinga', 'mierda', 'culer', 'nigg', 'fuck', 'shit', 'nazi', 'hitler'];
const METHODS = ['kofi', 'paypal', 'spei', 'otro'];

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

export function applyDonation(donorsDoc, supportDoc, input, today = new Date()) {
  const doc = structuredClone(donorsDoc);
  doc.donors ??= [];
  doc.processed ??= [];
  doc.raisedMXN ??= 0;

  const method = METHODS.includes(input.method) ? input.method : 'otro';
  const id = input.id ? hashId(`${method}:${input.id}`) : null;
  if (id && doc.processed.includes(id)) return { doc, changed: false, reason: 'duplicada' };

  const result = { doc, changed: false, reason: 'privada', published: null };

  if (supportDoc.trackTotals) {
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

  if (input.public === true || input.public === 'true' || input.public === 'si' || input.public === 'Sí') {
    const name = cleanName(input.name);
    if (name) {
      const month = today.toISOString().slice(0, 7);
      const existing = doc.donors.find((d) => d.name.toLowerCase() === name.toLowerCase());
      if (!existing) {
        doc.donors.push({ name, since: month });
        result.changed = true;
      }
      result.reason = existing ? 'ya estaba en el muro' : 'publicada';
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
  // Resumen para el log del workflow (sin datos personales más allá del nombre público).
  console.log(`Donación ${input.method ?? 'otro'}: ${reason}${published ? ` (${published})` : ''}. Cambios: ${changed ? 'sí' : 'no'}`);
  if (process.env.GITHUB_OUTPUT) {
    await writeFile(process.env.GITHUB_OUTPUT, `changed=${changed}\npublished=${published ?? ''}\n`, { flag: 'a' });
  }
}
