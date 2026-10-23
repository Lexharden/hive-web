// Clasifica los archivos de un GitHub Release por plataforma, arquitectura y tipo.
// Se usa en el build y también en el navegador (refresco en vivo), así que no
// depende de Node.

export type Platform = 'windows' | 'macos' | 'linux' | 'android';
export type Arch = 'x64' | 'arm64' | 'universal';
export type Kind = 'installer' | 'portable' | 'package' | 'update' | 'checksum' | 'signature' | 'manifest' | 'other';

export interface RawAsset {
  name: string;
  browser_download_url: string;
  size: number;
  download_count?: number;
}

export interface Asset {
  name: string;
  url: string;
  size: number;
  downloads: number;
  platform?: Platform;
  arch?: Arch;
  kind: Kind;
  ext: string;
  /** Clave estable entre versiones (p. ej. "windows-x64-installer-exe"). */
  key: string;
  label: string;
  rank: number; // menor = mejor candidato a botón principal
}

export const platformNames: Record<Platform, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
  android: 'Android',
};

const archNames: Record<Arch, string> = {
  x64: 'x64',
  arm64: 'ARM64',
  universal: '',
};

function extOf(name: string): string {
  const n = name.toLowerCase();
  if (n.endsWith('.app.tar.gz')) return 'app.tar.gz';
  if (n.endsWith('.tar.gz')) return 'tar.gz';
  const i = n.lastIndexOf('.');
  return i >= 0 ? n.slice(i + 1) : '';
}

function detectPlatform(n: string, ext: string): Platform | undefined {
  if (ext === 'apk' || /android/.test(n)) return 'android';
  if (ext === 'exe' || ext === 'msi' || /(^|[-_.])win(64|32|dows)?([-_.]|$)|win-x64/.test(n)) return 'windows';
  if (ext === 'dmg' || ext === 'app.tar.gz' || /osx|macos|darwin|(^|[-_.])mac([-_.]|$)/.test(n)) return 'macos';
  if (['appimage', 'deb', 'rpm'].includes(ext) || /linux/.test(n)) return 'linux';
  return undefined;
}

function detectArch(n: string, platform?: Platform): Arch | undefined {
  if (/arm64|aarch64/.test(n)) return 'arm64';
  if (/x64|amd64|x86_64|win64/.test(n)) return 'x64';
  if (platform === 'macos' || platform === 'android') return 'universal';
  if (platform) return 'x64';
  return undefined;
}

function detectKind(n: string, ext: string): Kind {
  if (ext === 'sig' || ext === 'asc') return 'signature';
  if (n === 'latest.json' || n.endsWith('.yml')) return 'manifest';
  if (/sha256|checksum/.test(n)) return 'checksum';
  if (/update/.test(n) || ext === 'app.tar.gz') return 'update';
  if (['exe', 'dmg', 'apk'].includes(ext)) return 'installer';
  if (['msi', 'deb', 'rpm'].includes(ext)) return 'package';
  if (['zip', 'appimage', 'tar.gz', '7z'].includes(ext)) return 'portable';
  return 'other';
}

function labelFor(kind: Kind, ext: string, platform?: Platform, arch?: Arch): string {
  const e = '.' + ext.replace('appimage', 'AppImage');
  let what: string;
  switch (kind) {
    case 'installer':
      what = ext === 'dmg' ? `Imagen de disco ${e}` : ext === 'apk' ? `APK ${e}` : `Instalador ${e}`;
      break;
    case 'package':
      what = `Paquete ${e}`;
      break;
    case 'portable':
      what = ext === 'appimage' ? `AppImage portable` : `Portable ${e}`;
      break;
    case 'update':
      what = `Actualización ${e}`;
      break;
    case 'checksum':
      return 'Sumas SHA-256';
    default:
      what = e;
  }
  if (platform === 'macos' && arch && arch !== 'universal') {
    return `${what} para ${arch === 'arm64' ? 'Apple Silicon' : 'Intel'}`;
  }
  if (platform === 'linux' && arch === 'arm64') return `${what} ARM64`;
  return what;
}

function rankFor(kind: Kind, ext: string, platform?: Platform, arch?: Arch): number {
  const base: Record<string, number> = { exe: 0, dmg: 0, apk: 0, appimage: 1, msi: 3, deb: 4, rpm: 5, zip: 2 };
  let r = base[ext] ?? 8;
  if (kind === 'update' || kind === 'signature' || kind === 'manifest') r += 50;
  // Mac: primero Apple Silicon. Linux: primero x64.
  if (arch === 'arm64') r += platform === 'macos' ? -0.5 : 0.5;
  return r;
}

export function classify(a: RawAsset): Asset {
  const n = a.name.toLowerCase();
  const ext = extOf(n);
  const kind = detectKind(n, ext);
  const platform = kind === 'checksum' || kind === 'manifest' ? undefined : detectPlatform(n, ext);
  const arch = detectArch(n, platform);
  const key = [platform ?? 'any', arch ?? 'any', kind, ext].join('-');
  return {
    name: a.name,
    url: a.browser_download_url,
    size: a.size,
    downloads: a.download_count ?? 0,
    platform,
    arch,
    kind,
    ext,
    key,
    label: labelFor(kind, ext, platform, arch),
    rank: rankFor(kind, ext, platform, arch),
  };
}

/** Archivos que se muestran a la gente (sin firmas, manifiestos ni paquetes de autoactualización). */
export function visibleAssets(assets: Asset[]): Asset[] {
  return assets
    .filter((a) => a.platform && (a.kind === 'installer' || a.kind === 'portable' || a.kind === 'package'))
    .sort((a, b) => a.rank - b.rank);
}

export function byPlatform(assets: Asset[]): Partial<Record<Platform, Asset[]>> {
  const out: Partial<Record<Platform, Asset[]>> = {};
  for (const a of visibleAssets(assets)) {
    (out[a.platform!] ??= []).push(a);
  }
  return out;
}

export function formatSize(bytes: number): string {
  if (!bytes) return '';
  const mb = bytes / 1024 / 1024;
  return mb >= 100 ? `${Math.round(mb)} MB` : `${mb.toFixed(1).replace('.', ',')} MB`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Mexico_City' });
}

export function archLabel(a: Asset): string {
  return a.arch ? archNames[a.arch] : '';
}
