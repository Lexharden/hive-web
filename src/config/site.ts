// Configuración central del sitio. Todo lo que no viene de GitHub vive aquí:
// enlaces, textos de cada app y la lista de juegos compatibles.

export const site = {
  name: 'Hive',
  owner: 'Yafel',
  url: 'https://hive.yafel.dev',
  description:
    'HiveShock y HiveBuzz: herramientas gratuitas para streamers de TikTok LIVE y Twitch. Efectos en el juego, alertas, voz y overlays.',
  links: {
    discord: 'https://discord.gg/QTdQffuZF3',
    youtube: 'https://www.youtube.com/@HiveShock',
    kofi: 'https://ko-fi.com/yafel',
    instagram: 'https://www.instagram.com/yaafel/',
    github: 'https://github.com/Lexharden',
  },
};

export type AppId = 'hiveshock' | 'hivebuzz';

export interface AppInfo {
  id: AppId;
  name: string;
  repo: string; // owner/name
  logo: string;
  tagline: string;
  summary: string;
  alternativeTo: string;
  platforms: Array<'windows' | 'macos' | 'linux' | 'android'>;
  stack: string;
}

export const apps: Record<AppId, AppInfo> = {
  hiveshock: {
    id: 'hiveshock',
    name: 'HiveShock',
    repo: 'Lexharden/HiveShock-Avalonia',
    logo: '/img/hiveshock',
    tagline: 'Tu chat juega contigo.',
    summary:
      'Convierte regalos, chat, follows y bits de TikTok y Twitch en efectos dentro del juego: enemigos, daño, curas, gravedad loca y más.',
    alternativeTo: 'Crowd Control',
    platforms: ['windows', 'macos', 'linux', 'android'],
    stack: '.NET 10 y Avalonia',
  },
  hivebuzz: {
    id: 'hivebuzz',
    name: 'HiveBuzz',
    repo: 'Lexharden/HiveBuzz',
    logo: '/img/hivebuzz',
    tagline: 'Tu live, con voz y pantalla propia.',
    summary:
      'Alertas, voz (TTS), overlays para OBS, metas, timers, puntos, ruleta y encuestas. Todo corre en tu PC, sin cuentas ni servidores.',
    alternativeTo: 'TikFinity',
    platforms: ['windows', 'macos', 'linux'],
    stack: 'Tauri 2, Rust y React',
  },
};

export interface Game {
  id: string;
  title: string;
  port: string;
  effects: number; // efectos del perfil incluido en HiveShock
  /** Repo del port con HiveShock integrado; sus releases alimentan las descargas. */
  repo?: string;
  /** Web oficial del port base, para quien quiera saber más. */
  upstream?: string;
  howTo: string;
  sample: string[]; // ejemplos reales de regalo → efecto del perfil
}

// Los conteos de efectos salen de config/profiles/*/effects.json en HiveShock-Avalonia.
export const games: Game[] = [
  {
    id: 'majoras-mask',
    title: "Majora's Mask",
    port: '2 Ship 2 Harkinian',
    effects: 67,
    repo: 'Lexharden/2ship2harkinian-HiveShock',
    upstream: 'https://github.com/HarbourMasters/2ship2harkinian',
    howTo: 'Entra en una partida y activa HiveShock en el menú Cheats.',
    sample: ['Un cucco', 'Stick invertido 20 s', 'Un hada', 'Enemigo aleatorio'],
  },
  {
    id: 'ocarina-of-time',
    title: 'Ocarina of Time',
    port: 'Ship of Harkinian',
    effects: 59,
    repo: 'Lexharden/Shipwright-HiveShock',
    upstream: 'https://www.shipofharkinian.com',
    howTo: 'Entra en una partida y activa HiveShock en Enhancements.',
    sample: ['Dark Link', '+10 rupias', 'Cura 1 corazón', 'Instakill'],
  },
  {
    id: 'twilight-princess',
    title: 'Twilight Princess',
    port: 'Dusklight',
    effects: 69,
    howTo: 'Entra en una partida y activa el puente en el menú Mods.',
    sample: ['Manada de bokoblins', 'Botas de hierro', 'Bestia de las Sombras', 'Llena el farol'],
  },
  {
    id: 'super-mario-64',
    title: 'Super Mario 64',
    port: 'Ghostship',
    effects: 36,
    howTo: 'Abre Network › HiveShock y activa Enable HiveShock.',
    sample: ['Cáscara de plátano', 'Un Bob-omb', 'Gravedad baja 20 s', 'Hongo venenoso'],
  },
  {
    id: 'banjo-kazooie',
    title: 'Banjo-Kazooie',
    port: 'Banjo-Kazooie: Recompiled',
    effects: 22,
    howTo: 'Instala el mod HiveShock y actívalo en el menú de mods.',
    sample: ['10 huevos azules', 'Vida extra', 'Quita 1 panal', 'Aparece Bigbutt'],
  },
];

export const totalEffects = games.reduce((n, g) => n + g.effects, 0);
