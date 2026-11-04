// Actualiza src/data/snapshot.json con los releases reales de GitHub.
// El snapshot solo se usa si GitHub no responde durante el build.
// Uso: GITHUB_TOKEN=... npm run snapshot   (el token es opcional)
import { writeFile } from 'node:fs/promises';

const repos = [
  'Lexharden/HiveShock-Avalonia',
  'Lexharden/HiveBuzz',
  'Lexharden/Shipwright-HiveShock',
  'Lexharden/2ship2harkinian-HiveShock',
  'Lexharden/Dusklight-HiveShock',
];

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const out = {};
for (const repo of repos) {
  const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=50`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'hive-web',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub respondió ${res.status} para ${repo}`);
  const releases = await res.json();
  out[repo] = releases.map((r) => ({
    tag_name: r.tag_name,
    name: r.name,
    prerelease: r.prerelease,
    draft: r.draft,
    published_at: r.published_at,
    html_url: r.html_url,
    body: r.body,
    assets: r.assets.map((a) => ({
      name: a.name,
      size: a.size,
      download_count: a.download_count,
      browser_download_url: a.browser_download_url,
    })),
  }));
  console.log(`${repo}: ${out[repo].length} releases`);
}
await writeFile(new URL('../src/data/snapshot.json', import.meta.url), JSON.stringify(out, null, 1) + '\n');
