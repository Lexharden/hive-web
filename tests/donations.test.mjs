import assert from 'node:assert/strict';
import { applyDonation, cleanName } from '../scripts/add-donation.mjs';
import { cleanHandle } from '../src/lib/socials.js';

const base = { donors: [], raisedMXN: 0, processed: [] };
const off = { trackTotals: false, usdToMxn: 18.5 };
const on = { trackTotals: true, usdToMxn: 18.5 };
const now = new Date('2026-10-30T12:00:00Z');

// pública por Ko-fi: abeja por defecto
let r = applyDonation(base, off, { id: 'k1', name: 'Oscar', method: 'kofi', amount: '5', currency: 'USD', public: true }, now);
assert.deepEqual(r.doc.donors, [{ name: 'Oscar', tier: 'abeja', since: '2026-10' }]);
assert.equal(r.doc.raisedMXN, 0);

// Ko-fi mensual = obrera
r = applyDonation(base, off, { id: 'k2', name: 'Guz', method: 'kofi', source: 'kofi-mensual', public: true }, now);
assert.equal(r.doc.donors[0].tier, 'obrera');

// duplicada
const r2 = applyDonation(applyDonation(base, off, { id: 'k1', name: 'Oscar', method: 'kofi', public: true }, now).doc, off, { id: 'k1', name: 'Oscar', method: 'kofi', public: true }, now);
assert.equal(r2.reason, 'duplicada');

// privada
r = applyDonation(base, off, { id: 'p1', name: 'Secreto', method: 'paypal', amount: 100, public: false }, now);
assert.equal(r.doc.donors.length, 0);

// con canales desde el formulario (usuario, @usuario y enlace)
r = applyDonation(base, off, {
  id: 'm1', name: 'Mint Kookie', method: 'spei', public: 'Sí', tier: 'abeja',
  tiktok: '@mint.kookie', twitch: 'https://www.twitch.tv/mintkookie?sr=a', youtube: 'https://youtube.com/@MintKookie', kick: 'no valido!!',
}, now);
assert.deepEqual(r.doc.donors[0].links, { tiktok: 'mint.kookie', twitch: 'mintkookie', youtube: 'MintKookie' });

// segunda donación de la misma persona: no duplica, sube de nivel y suma canales
let d = r.doc;
d = applyDonation(d, off, { id: 'm2', name: 'mint kookie', method: 'kofi', source: 'kofi-mensual', public: true, kick: 'mintk' }, now).doc;
assert.equal(d.donors.length, 1);
assert.equal(d.donors[0].tier, 'obrera');
assert.equal(d.donors[0].links.kick, 'mintk');
assert.equal(d.donors[0].links.tiktok, 'mint.kookie');

// una donación de nivel menor no baja el nivel
d = applyDonation(d, off, { id: 'm3', name: 'Mint Kookie', method: 'paypal', public: true, tier: 'abeja' }, now).doc;
assert.equal(d.donors[0].tier, 'obrera');

// actualizar: cambia nivel y canales sin donación nueva
d = applyDonation(d, off, { action: 'actualizar', name: 'Mint Kookie', tier: 'reina', twitch: 'mintlive' }, now).doc;
assert.equal(d.donors[0].tier, 'reina');
assert.equal(d.donors[0].links.twitch, 'mintlive');

// actualizar a alguien que no existe no lo crea
r = applyDonation(d, off, { action: 'actualizar', name: 'Nadie', tier: 'abeja' }, now);
assert.equal(r.changed, false);

// quitar
r = applyDonation(d, off, { action: 'quitar', name: 'MINT KOOKIE' }, now);
assert.equal(r.doc.donors.length, 0);

// totales
let t = applyDonation(base, on, { id: 'a', method: 'kofi', amount: '2', currency: 'USD' }, now).doc;
t = applyDonation(t, on, { id: 'b', method: 'spei', amount: 150, currency: 'MXN' }, now).doc;
t = applyDonation(t, on, { id: 'c', method: 'paypal', amount: 10, currency: 'EUR' }, now).doc;
assert.equal(t.raisedMXN, 187);

// limpieza
assert.equal(cleanName('  @ralbat_  '), 'ralbat_');
assert.equal(cleanName('visita https://spam.com'), null);
assert.equal(cleanName('<b>Mint</b> Kookie'), 'Mint Kookie');
assert.equal(cleanName('pendejo123'), null);
assert.equal(cleanName('Ximezzle‮evil'), 'Ximezzleevil');
assert.equal(cleanHandle('tiktok', 'https://www.tiktok.com/@el_pinchiviejo?lang=es'), 'el_pinchiviejo');
assert.equal(cleanHandle('tiktok', 'https://evil.com/@x'), null);
assert.equal(cleanHandle('twitch', 'TheMaximusGT'), 'TheMaximusGT');
assert.equal(cleanHandle('twitch', 'javascript:alert(1)'), null);
assert.equal(cleanHandle('youtube', '@EspartaGames'), 'EspartaGames');
assert.equal(cleanHandle('x', 'twitter.com/Michindorf'), 'Michindorf');

console.log('Todas las pruebas pasaron');
