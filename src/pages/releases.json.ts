// /releases.json: resumen público de la última versión de cada app y port.
// Útil para un bot de Discord, un widget o las propias apps.
import type { APIRoute } from 'astro';
import { apps, games } from '../config/site';
import { getReleases } from '../lib/releases';
import { visibleAssets } from '../lib/assets';

export const GET: APIRoute = async () => {
  const repos = [
    ...Object.values(apps).map((a) => ({ id: a.id, name: a.name, repo: a.repo })),
    ...games.filter((g) => g.repo).map((g) => ({ id: g.id, name: `${g.port} con HiveShock`, repo: g.repo! })),
  ];
  const out = await Promise.all(
    repos.map(async (r) => {
      const d = await getReleases(r.repo);
      const rel = d.latest;
      return {
        id: r.id,
        name: r.name,
        version: rel?.version ?? null,
        publishedAt: rel?.publishedAt ?? null,
        prerelease: d.latestPre ? { version: d.latestPre.version } : null,
        files: rel ? visibleAssets(rel.assets).map((a) => ({ name: a.name, url: a.url, size: a.size, platform: a.platform, arch: a.arch })) : [],
      };
    }),
  );
  return new Response(JSON.stringify({ generatedAt: new Date().toISOString(), apps: out }, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
