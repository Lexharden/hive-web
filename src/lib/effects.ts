// Cuenta los efectos de cada juego leyendo los perfiles que trae HiveShock
// (config/profiles/<perfil>/effects.json en el repo de la app).
// Así el número de la web siempre coincide con la última versión.
// Si no hay red, se usa el número escrito en src/config/site.ts.
import { apps, games, type Game } from '../config/site';

const cache = new Map<string, Promise<number>>();

async function count(game: Game): Promise<number> {
  if (!game.profile) return game.effects;
  const url = `https://raw.githubusercontent.com/${apps.hiveshock.repo}/main/config/profiles/${game.profile}/effects.json`;
  try {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {}, signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    const n = Object.keys(data).filter((k) => !k.startsWith('_')).length;
    return n > 0 ? n : game.effects;
  } catch (err) {
    // En CI no se publica un número viejo: igual que con los releases, el build falla.
    if (process.env.REQUIRE_GITHUB === '1') throw err;
    return game.effects;
  }
}

export async function totalEffectsLive(): Promise<number> {
  const list = await gamesWithEffects();
  return list.reduce((n, g) => n + g.effects, 0);
}

export function effectsFor(game: Game): Promise<number> {
  if (!cache.has(game.id)) cache.set(game.id, count(game));
  return cache.get(game.id)!;
}

/** Juegos con el conteo de efectos ya actualizado. */
export async function gamesWithEffects(): Promise<Game[]> {
  return Promise.all(games.map(async (g) => ({ ...g, effects: await effectsFor(g) })));
}
