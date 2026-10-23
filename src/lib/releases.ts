// Lee los GitHub Releases de cada repo durante el build.
// - En CI usa GITHUB_TOKEN (límite de 1000 peticiones/hora en vez de 60).
// - Si GitHub no responde, usa src/data/snapshot.json para que el build no falle.
import { classify, type Asset, type RawAsset } from './assets';
import { renderMarkdown } from './markdown';
import snapshotData from '../data/snapshot.json';

export interface Release {
  tag: string;
  version: string;
  name: string;
  prerelease: boolean;
  publishedAt: string;
  url: string;
  bodyHtml: string;
  assets: Asset[];
  downloads: number;
}

export interface RepoReleases {
  repo: string;
  url: string;
  releases: Release[];
  latest?: Release; // última estable
  latestPre?: Release; // pre-release más nueva que la estable, si existe
  totalDownloads: number;
  source: 'github' | 'snapshot';
}

interface RawRelease {
  tag_name: string;
  name: string | null;
  prerelease: boolean;
  draft: boolean;
  published_at: string | null;
  html_url: string;
  body: string | null;
  assets: RawAsset[];
}

const cache = new Map<string, Promise<RepoReleases>>();

async function fromGitHub(repo: string): Promise<RawRelease[]> {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=50`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'hive-web',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`GitHub ${res.status} en ${repo}`);
  return res.json();
}

async function fromSnapshot(repo: string): Promise<RawRelease[]> {
  return (snapshotData as unknown as Record<string, RawRelease[]>)[repo] ?? [];
}

function normalize(r: RawRelease): Release {
  const assets = r.assets.map(classify);
  return {
    tag: r.tag_name,
    version: r.tag_name.replace(/^v/, ''),
    name: r.name || r.tag_name,
    prerelease: r.prerelease,
    publishedAt: r.published_at ?? new Date().toISOString(),
    url: r.html_url,
    bodyHtml: renderMarkdown(r.body ?? ''),
    assets,
    downloads: assets.reduce((n, a) => n + a.downloads, 0),
  };
}

async function load(repo: string): Promise<RepoReleases> {
  let raw: RawRelease[];
  let source: RepoReleases['source'] = 'github';
  try {
    raw = await fromGitHub(repo);
  } catch (err) {
    if (process.env.REQUIRE_GITHUB === '1') throw err;
    console.warn(`[releases] ${(err as Error).message}; uso el snapshot local.`);
    raw = await fromSnapshot(repo);
    source = 'snapshot';
  }
  const releases = raw
    .filter((r) => !r.draft && r.published_at)
    .map(normalize)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const latest = releases.find((r) => !r.prerelease);
  const pre = releases.find((r) => r.prerelease);
  return {
    repo,
    url: `https://github.com/${repo}`,
    releases,
    latest,
    latestPre: pre && (!latest || pre.publishedAt > latest.publishedAt) ? pre : undefined,
    totalDownloads: releases.reduce((n, r) => n + r.downloads, 0),
    source,
  };
}

export function getReleases(repo: string): Promise<RepoReleases> {
  if (!cache.has(repo)) cache.set(repo, load(repo));
  return cache.get(repo)!;
}
