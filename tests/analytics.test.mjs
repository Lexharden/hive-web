import assert from 'node:assert/strict';
import { isValidGaId, cleanGaId, classifyLink, downloadParams } from '../src/lib/analytics.ts';

// ID de medición
assert.equal(isValidGaId('G-ABC123XYZ9'), true);
assert.equal(isValidGaId('UA-12345-1'), false);
assert.equal(isValidGaId('G-'), false);
assert.equal(isValidGaId(undefined), false);
assert.equal(cleanGaId(' G-ABC123XYZ9 '), 'G-ABC123XYZ9');
assert.equal(cleanGaId(''), undefined);

// enlaces externos
const host = 'hive.yafel.dev';
assert.equal(classifyLink('https://discord.gg/QTdQffuZF3', host), 'discord');
assert.equal(classifyLink('https://www.youtube.com/@HiveShock', host), 'youtube');
assert.equal(classifyLink('https://ko-fi.com/yafel', host), 'kofi');
assert.equal(classifyLink('https://www.paypal.com/donate', host), 'paypal');
assert.equal(classifyLink('https://github.com/x/y/releases/download/v1/a.exe', host), 'github');
assert.equal(classifyLink('https://ejemplo.com', host), 'other');
assert.equal(classifyLink('https://notdiscord.gg.evil.com', host), 'other');
assert.equal(classifyLink('/apoyar/', host), null);
assert.equal(classifyLink('https://hive.yafel.dev/legal/', host), null);
assert.equal(classifyLink('mailto:a@b.c', host), null);

// descargas
const p = downloadParams({
  href: 'https://github.com/o/r/releases/download/v2.1.0/HiveShock-2.1.0-win-x64-setup.exe',
  key: 'windows-x64-installer-exe',
  app: 'HiveShock',
  tag: 'v2.1.0',
});
assert.equal(p.file_name, 'HiveShock-2.1.0-win-x64-setup.exe');
assert.equal(p.file_extension, 'exe');
assert.equal(p.app, 'HiveShock');
assert.equal(p.version, 'v2.1.0');

console.log('analytics ok');
