/**
 * Static pre-rendering: renders every route to its own index.html so each
 * page ships real HTML (fast first paint, SEO, LinkedIn/OG previews), then
 * React hydrates it. Also writes sitemap.xml, robots.txt and 404.html.
 *
 * Runs after `vite build` (client) and `vite build --ssr` (server bundle).
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');
const SSR_ENTRY = join(DIST, '.ssr/entry-server.js');
const BASE = (process.env.BASE_PATH || '/').replace(/\/?$/, '/');

interface ServerModule {
  render: (path: string, base: string) => { html: string; head: string; lang: string };
  projects: { slug: string }[];
  LEGAL_SLUGS: readonly string[];
  site: { url: string };
}

const mod = (await import(pathToFileURL(SSR_ENTRY).href)) as ServerModule;
const template = readFileSync(join(DIST, 'index.html'), 'utf8');

const routes = ['/', '/es/'];
for (const p of mod.projects) routes.push(`/work/${p.slug}/`, `/es/work/${p.slug}/`);
for (const slug of mod.LEGAL_SLUGS) routes.push(`/${slug}/`, `/es/${slug}/`);

function page(route: string): string {
  const url = BASE.replace(/\/$/, '') + route;
  const { html, head, lang } = mod.render(url, BASE);
  return template
    .replace('<html lang="en">', `<html lang="${lang}">`)
    .replace('<!--app-head-->', head)
    .replace('<!--app-html-->', html);
}

for (const route of routes) {
  const file = join(DIST, route, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page(route));
}
writeFileSync(join(DIST, '404.html'), page('/404/'));

// Sitemap + robots — only meaningful with an absolute SITE_URL.
const siteUrl = (process.env.SITE_URL || mod.site.url || '').replace(/\/$/, '');
if (siteUrl) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = routes
    .map((r) => `  <url><loc>${siteUrl}${BASE.replace(/\/$/, '')}${r}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n');
  writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}${BASE}sitemap.xml\n`);
} else {
  writeFileSync(join(DIST, 'robots.txt'), 'User-agent: *\nAllow: /\n');
  console.warn('  ⚠ SITE_URL not set — sitemap.xml skipped, canonical/og:url omitted. See .env.example.');
}

rmSync(join(DIST, '.ssr'), { recursive: true, force: true });
console.log(`✓ prerendered ${routes.length} routes + 404.html`);
