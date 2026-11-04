import supportData from '../data/support.json';
import donorsData from '../data/donors.json';
import creditsData from '../data/credits.json';
// Configuración central del sitio. Todo lo que no viene de los releases vive aquí:
// enlaces, textos de cada app, juegos compatibles y la forma de apoyar el proyecto.

export const site = {
  name: 'Hive',
  owner: 'Yafel',
  // Mismo valor que usa astro.config.mjs, para que JSON-LD y SEO sigan al dominio configurado.
  url: process.env.SITE_URL || 'https://hive.yafel.dev',
  description:
    'HiveShock y HiveBuzz: herramientas gratuitas para streamers de TikTok LIVE y Twitch. Tu comunidad controla el juego con regalos y chat; alertas, voz y overlays para tu stream.',
  links: {
    discord: 'https://discord.gg/QTdQffuZF3',
    youtube: 'https://www.youtube.com/@HiveShock',
    kofi: 'https://ko-fi.com/yafel',
    instagram: 'https://www.instagram.com/yaafel/',
  },
  /** Fecha de la última revisión del aviso legal. Cámbiala cuando edites /legal/. */
  legalUpdated: '2026-10-30',
  /** Mostrar descargas de los ports en la web. En false, solo se muestra cómo activarlos. */
  showPortDownloads: true,
  /** Mostrar patrocinadores (franja de la portada, bloque, nivel Reina y su pregunta en /apoyar/). Temporalmente oculto. */
  showSponsors: false,
};

export type AppId = 'hiveshock' | 'hivebuzz';

export interface AppInfo {
  id: AppId;
  name: string;
  repo: string; // owner/name: solo se usa para leer los releases, nunca se muestra
  logo: string;
  role: string; // qué es, en tres o cuatro palabras
  tagline: string;
  summary: string;
  platforms: Array<'windows' | 'macos' | 'linux' | 'android'>;
  stack: string;
}

export const apps: Record<AppId, AppInfo> = {
  hiveshock: {
    id: 'hiveshock',
    name: 'HiveShock',
    repo: 'Lexharden/HiveShock-Avalonia',
    logo: '/img/hiveshock',
    role: 'Tu chat dentro del juego',
    tagline: 'Tu chat juega contigo.',
    summary:
      'Convierte regalos, chat, follows y bits de TikTok y Twitch en efectos dentro del juego: enemigos, daño, curas, gravedad loca y más.',
    platforms: ['windows', 'macos', 'linux', 'android'],
    stack: '.NET 10 y Avalonia',
  },
  hivebuzz: {
    id: 'hivebuzz',
    name: 'HiveBuzz',
    repo: 'Lexharden/HiveBuzz',
    logo: '/img/hivebuzz',
    role: 'Alertas, voz y overlays',
    tagline: 'Tu live, con voz y pantalla propia.',
    summary:
      'Alertas, voz (TTS), overlays para OBS, metas, timers, puntos, ruleta y encuestas. Todo corre en tu PC, sin cuentas ni servidores.',
    platforms: ['windows', 'macos', 'linux'],
    stack: 'Tauri 2, Rust y React',
  },
};

export interface Game {
  id: string;
  title: string;
  port: string;
  /** Carpeta del perfil en HiveShock (config/profiles/<perfil>). Con ella el número de efectos se lee solo. */
  profile?: string;
  effects: number; // respaldo si no se puede leer el perfil
  /** Repo del port con HiveShock integrado; sus releases alimentan las descargas (no se muestra). */
  repo?: string;
  kind: 'port' | 'mod';
  howTo: string;
  /** Pasos de instalación (HTML) que se muestran bajo el botón de descarga. Útil para mods, que no llevan instalador. */
  install?: string;
  sample: string[]; // ejemplos reales de regalo → efecto del perfil
}

// Los conteos de efectos salen de config/profiles/*/effects.json en HiveShock.
// Para añadir un juego de cualquier consola o PC, agrega una entrada aquí.
export const games: Game[] = [
  {
    id: 'majoras-mask',
    title: "Majora's Mask",
    port: '2 Ship 2 Harkinian',
    profile: 'majora-mask',
    effects: 67,
    repo: 'Lexharden/2ship2harkinian-HiveShock',
    kind: 'port',
    howTo: 'Entra en una partida y activa HiveShock en el menú Cheats.',
    sample: ['Un cucco', 'Stick invertido 20 s', 'Un hada', 'Enemigo aleatorio'],
  },
  {
    id: 'ocarina-of-time',
    title: 'Ocarina of Time',
    port: 'Ship of Harkinian',
    profile: 'ocarina-of-time',
    effects: 74,
    repo: 'Lexharden/Shipwright-HiveShock',
    kind: 'port',
    howTo: 'Entra en una partida y activa HiveShock en Enhancements.',
    sample: ['Dark Link', 'Ganon bestia', 'Flare Dancer', '+10 rupias'],
  },
  {
    id: 'twilight-princess',
    title: 'Twilight Princess',
    port: 'Dusklight',
    profile: 'dusklight',
    effects: 69,
    repo: 'Lexharden/Dusklight-HiveShock',
    kind: 'mod',
    howTo: 'Entra en una partida y activa el puente en el menú Mods.',
    install: 'Copia el archivo <code>.dusk</code> a <code>%APPDATA%\\TwilitRealm\\Dusklight\\mods</code> y abre Dusklight.',
    sample: ['Manada de bokoblins', 'Botas de hierro', 'Bestia de las Sombras', 'Llena el farol'],
  },
  {
    id: 'super-mario-64',
    title: 'Super Mario 64',
    port: 'Ghostship',
    profile: 'super-mario-64',
    effects: 36,
    kind: 'port',
    howTo: 'Abre Network › HiveShock y activa Enable HiveShock.',
    sample: ['Cáscara de plátano', 'Un Bob-omb', 'Gravedad baja 20 s', 'Hongo venenoso'],
  },
  {
    id: 'banjo-kazooie',
    title: 'Banjo-Kazooie',
    port: 'Banjo-Kazooie: Recompiled',
    profile: 'banjo-kazooie',
    effects: 32,
    kind: 'mod',
    howTo: 'Instala el mod HiveShock y actívalo en el menú de mods.',
    sample: ['Snippet mutante', 'Salto gigante', 'Cámara lenta', 'Emboscada'],
  },
];

export const totalEffects = games.reduce((n, g) => n + g.effects, 0);

// ---------- Apoyo al proyecto ----------
// Lo que se edita a mano vive en src/data/support.json; los donadores, en src/data/donors.json.

export interface WorkArea {
  icon: string;
  title: string;
  text: string;
}
export interface SpeiAccount { bank: string; clabe: string }
export type TierId = 'abeja' | 'obrera' | 'reina';
export interface Supporter { name: string; url?: string; logo?: string }
export interface Donor { name: string; tier?: TierId; since?: string; links?: Record<string, string> }

/** Persona a la que se da crédito. `links` usa las redes de lib/socials.js (usuario o enlace); `extra` admite cualquier otro sitio. */
export interface Credit {
  name: string;
  role?: string;
  note?: string;
  links?: Record<string, string>;
  extra?: Array<{ label: string; url: string }>;
}

export const support = supportData as unknown as {
  trackTotals: boolean;
  usdToMxn: number;
  methods: {
    paypal: { label: string; href: string; text: string };
    kofi: { label: string; href: string; text: string };
    spei: { label: string; text: string; holder: string; concept: string; accounts: SpeiAccount[] };
  };
  work: WorkArea[];
  tiers: Array<{ id: TierId; name: string; when: string; perks: string[]; featured?: boolean }>;
  sponsors: Supporter[];
};

export const sponsors: Supporter[] = support.sponsors ?? [];
const tierRank: Record<TierId, number> = { reina: 0, obrera: 1, abeja: 2 };
/** Donadores en orden: Reina, Obrera, Abeja; dentro de cada nivel, quien apoya desde antes va primero. */
export const donors: Donor[] = ((donorsData.donors as Donor[]) ?? [])
  .slice()
  .sort((a, b) => tierRank[a.tier ?? 'abeja'] - tierRank[b.tier ?? 'abeja'] || (a.since ?? '').localeCompare(b.since ?? '') || a.name.localeCompare(b.name));

/** Créditos en el orden en que se escriben en src/data/credits.json. */
export const credits: Credit[] = (creditsData.people as Credit[]) ?? [];
