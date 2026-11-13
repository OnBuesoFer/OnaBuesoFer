import { site } from '../config/site.ts';
import { getProject } from '../config/projects.ts';
import { dictionaries } from '../config/i18n.ts';
import { legal } from '../config/legal.ts';
import { posterUrl } from './media.ts';
import { routePath, type Route } from './router.tsx';
import type { Lang } from '../types/content.ts';

export interface HeadData {
  lang: Lang;
  title: string;
  description: string;
  path: string;
  alternates: { lang: Lang; path: string }[];
  image: string;
  imageAlt: string;
  type: 'website' | 'article';
  noindex: boolean;
}

const abs = (p: string) => (site.url ? site.url.replace(/\/$/, '') + p : p);

/** Page metadata for a route — shared by the pre-renderer and the client. */
export function headFor(route: Route): HeadData {
  const lang = route.lang;
  const t = dictionaries[lang];
  const base = {
    lang,
    path: routePath(route),
    alternates: (['en', 'es'] as const).map((l) => ({ lang: l, path: routePath({ ...route, lang: l } as Route) })),
    image: `/${site.seo.ogImage}`,
    imageAlt: `${site.name} — ${site.title}`,
    type: 'website' as const,
    noindex: false,
  };
  if (route.name === 'project') {
    const p = getProject(route.slug);
    if (p) {
      return {
        ...base,
        title: `${p.title} — ${p.category[lang]} · ${site.name}`,
        description: p.summary.draft && !p.cover ? site.seo.description[lang] : p.summary[lang],
        image: p.cover ? posterUrl(p.cover.file, 1200, 'jpg').replace(import.meta.env.BASE_URL, '/') : base.image,
        imageAlt: p.cover ? p.cover.alt[lang] : base.imageAlt,
        type: 'article',
      };
    }
  }
  if (route.name === 'legal') {
    const doc = legal[route.slug];
    return { ...base, title: `${doc.title[lang]} · ${site.name}`, description: doc.intro[lang] };
  }
  if (route.name === 'notfound' || (route.name === 'project' && !getProject(route.slug))) {
    return { ...base, title: `${t.notFound.title} · ${site.name}`, description: t.notFound.body, noindex: true };
  }
  return { ...base, title: site.seo.title, description: site.seo.description[lang] };
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Serialised <head> tags for static pre-rendering. */
export function headHtml(h: HeadData, basePath: string): string {
  const url = (p: string) => abs(basePath.replace(/\/$/, '') + p);
  const tags = [
    `<title>${esc(h.title)}</title>`,
    `<meta name="description" content="${esc(h.description)}">`,
    h.noindex ? '<meta name="robots" content="noindex">' : '',
    site.url ? `<link rel="canonical" href="${url(h.path)}">` : '',
    ...h.alternates.map((a) => (site.url ? `<link rel="alternate" hreflang="${a.lang}" href="${url(a.path)}">` : '')),
    site.url ? `<link rel="alternate" hreflang="x-default" href="${url(h.alternates[0]!.path)}">` : '',
    `<meta property="og:type" content="${h.type}">`,
    `<meta property="og:site_name" content="${esc(site.name)}">`,
    `<meta property="og:title" content="${esc(h.title)}">`,
    `<meta property="og:description" content="${esc(h.description)}">`,
    `<meta property="og:locale" content="${h.lang === 'es' ? 'es_ES' : 'en_GB'}">`,
    site.url ? `<meta property="og:url" content="${url(h.path)}">` : '',
    `<meta property="og:image" content="${url(h.image)}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="${h.image.includes('poster') ? 750 : 630}">`,
    `<meta property="og:image:alt" content="${esc(h.imageAlt)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
  ];
  return tags.filter(Boolean).join('\n    ');
}
