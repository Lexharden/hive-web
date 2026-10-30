import assert from 'node:assert/strict';
import { classify, visibleAssets, byPlatform, formatSize } from '../src/lib/assets.ts';

const mk = (name) => classify({ name, browser_download_url: `https://x/${name}`, size: 1024 * 1024 * 50 });

// plataforma, arquitectura y tipo por nombre de archivo
let a = mk('HiveShock-2.12.0-win-x64-setup.exe');
assert.deepEqual([a.platform, a.arch, a.kind], ['windows', 'x64', 'installer']);
a = mk('HiveShock_2.12.0_aarch64.dmg');
assert.deepEqual([a.platform, a.arch, a.kind], ['macos', 'arm64', 'installer']);
a = mk('HiveShock-2.12.0-linux-x86_64.AppImage');
assert.deepEqual([a.platform, a.arch, a.kind], ['linux', 'x64', 'portable']);
a = mk('HiveShock-2.12.0.apk');
assert.deepEqual([a.platform, a.arch, a.kind], ['android', 'universal', 'installer']);

// no se muestran firmas, manifiestos ni paquetes de autoactualización
const hidden = ['app.exe.sig', 'latest.json', 'HiveBuzz.app.tar.gz', 'HiveBuzz-update.zip'].map(mk);
assert.equal(visibleAssets(hidden).length, 0);
assert.equal(mk('SHA256SUMS.txt').kind, 'checksum');

// el botón principal de cada plataforma es el instalador, no el .msi
const win = byPlatform([mk('app-win-x64.msi'), mk('app-win-x64.exe')]).windows;
assert.equal(win[0].ext, 'exe');

// la clave es estable entre versiones (la usa el refresco en el navegador)
assert.equal(mk('HiveShock-2.12.0-win-x64-setup.exe').key, 'windows-x64-installer-exe');

assert.equal(formatSize(50 * 1024 * 1024), '50,0 MB');
console.log('Pruebas de assets: ok');
