import { site, type AppInfo } from '../config/site';
import type { RepoReleases } from './releases';
import { platformNames } from './assets';

export function softwareJsonLd(app: AppInfo, data: RepoReleases) {
  const rel = data.latest;
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: app.name,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: app.platforms.map((p) => platformNames[p]).join(', '),
    description: app.summary,
    url: `${site.url}/${app.id}/`,
    downloadUrl: `${site.url}/${app.id}/#descargar`,
    softwareVersion: rel?.version,
    datePublished: rel?.publishedAt,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'MXN' },
    author: { '@type': 'Person', name: site.owner },
    inLanguage: 'es',
  };
}
