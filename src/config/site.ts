// Configuración central del sitio. Todo lo que no viene de los releases vive aquí:
// enlaces, textos de cada app, juegos compatibles y la forma de apoyar el proyecto.

export const site = {
  name: 'Hive',
  owner: 'Yafel',
  url: 'https://hive.yafel.dev',
  description:
    'HiveShock y HiveBuzz: herramientas gratuitas para streamers de TikTok LIVE y Twitch. Tu comunidad controla el juego con regalos y chat; alertas, voz y overlays para tu stream.',
  links: {
    discord: 'https://discord.gg/QTdQffuZF3',
    youtube: 'https://www.youtube.com/@HiveShock',
    kofi: 'https://ko-fi.com/yafel',
    instagram: 'https://www.instagram.com/yaafel/',
  },
  /** Fecha de la última revisión del aviso legal. Cámbiala cuando edites /legal/. */
  legalUpdated: '2026-10-23',
  /** Mostrar descargas de los ports en la web. En false, solo se muestra cómo activarlos. */
  showPortDownloads: true,
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
  effects: number; // efectos del perfil incluido en HiveShock
  /** Repo del port con HiveShock integrado; sus releases alimentan las descargas (no se muestra). */
  repo?: string;
  kind: 'port' | 'mod';
  howTo: string;
  sample: string[]; // ejemplos reales de regalo → efecto del perfil
}

// Los conteos de efectos salen de config/profiles/*/effects.json en HiveShock.
// Para añadir un juego de cualquier consola o PC, agrega una entrada aquí.
export const games: Game[] = [
  {
    id: 'majoras-mask',
    title: "Majora's Mask",
    port: '2 Ship 2 Harkinian',
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
    effects: 59,
    repo: 'Lexharden/Shipwright-HiveShock',
    kind: 'port',
    howTo: 'Entra en una partida y activa HiveShock en Enhancements.',
    sample: ['Dark Link', '+10 rupias', 'Cura 1 corazón', 'Instakill'],
  },
  {
    id: 'twilight-princess',
    title: 'Twilight Princess',
    port: 'Dusklight',
    effects: 69,
    kind: 'port',
    howTo: 'Entra en una partida y activa el puente en el menú Mods.',
    sample: ['Manada de bokoblins', 'Botas de hierro', 'Bestia de las Sombras', 'Llena el farol'],
  },
  {
    id: 'super-mario-64',
    title: 'Super Mario 64',
    port: 'Ghostship',
    effects: 36,
    kind: 'port',
    howTo: 'Abre Network › HiveShock y activa Enable HiveShock.',
    sample: ['Cáscara de plátano', 'Un Bob-omb', 'Gravedad baja 20 s', 'Hongo venenoso'],
  },
  {
    id: 'banjo-kazooie',
    title: 'Banjo-Kazooie',
    port: 'Banjo-Kazooie: Recompiled',
    effects: 22,
    kind: 'mod',
    howTo: 'Instala el mod HiveShock y actívalo en el menú de mods.',
    sample: ['10 huevos azules', 'Vida extra', 'Quita 1 panal', 'Aparece Bigbutt'],
  },
];

export const totalEffects = games.reduce((n, g) => n + g.effects, 0);

// ---------- Apoyo al proyecto ----------

export interface SupportGoal {
  title: string;
  text: string;
  /** Opcional: si pones ambos números, se muestra una barra de progreso. */
  raised?: number;
  target?: number;
}

export const support = {
  /** Botón principal de donación. Puedes añadir más métodos abajo. */
  primary: { label: 'Apoyar en Ko-fi', href: 'https://ko-fi.com/yafel' },
  methods: [
    { label: 'Ko-fi', text: 'Una vez o cada mes, con tarjeta o PayPal.', href: 'https://ko-fi.com/yafel' },
  ],
  goals: [
    {
      title: 'Firma de código para Windows',
      text: 'Un certificado quita el aviso de «aplicación no reconocida» al instalar.',
    },
    {
      title: 'Firma y notarización en macOS',
      text: 'La cuenta de desarrollador de Apple permite abrir las apps sin pasos extra.',
    },
    {
      title: 'Equipo para pruebas',
      text: 'Computadoras, consolas y teléfonos para probar cada port y la app de Android.',
    },
    {
      title: 'Tiempo para nuevos ports',
      text: 'Cada juego nuevo lleva semanas de integración, efectos y pruebas en directo.',
    },
  ] as SupportGoal[],
  tiers: [
    {
      name: 'Abeja',
      when: 'Una donación, de cualquier monto',
      perks: ['Tu nombre en el muro de donadores', 'Rol de donador en Discord'],
    },
    {
      name: 'Obrera',
      when: 'Apoyo mensual',
      perks: ['Todo lo de Abeja', 'Acceso anticipado a versiones de prueba', 'Canal privado para proponer efectos'],
      featured: true,
    },
    {
      name: 'Reina',
      when: 'Patrocinio de marca, equipo o creador',
      perks: ['Tu logo en esta página y en la portada', 'Mención en las notas de cada versión', 'Contacto directo para colaboraciones'],
    },
  ],
};

export interface Supporter {
  name: string;
  url?: string;
  logo?: string; // ruta en /public para patrocinadores
  note?: string;
}

/** Edita estas listas para mostrar a quienes apoyan. Vacías, la página muestra lugares disponibles. */
export const sponsors: Supporter[] = [];
export const donors: Supporter[] = [];
