/**
 * Minimal client router (History API). Two route types are all this site
 * needs, so a routing library would only add weight. The same parser runs
 * at build time to pre-render every route to static HTML.
 */
import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type AnchorHTMLAttributes, type MouseEvent, type ReactNode,
} from 'react';
import type { Lang } from '../types/content.ts';

export type Route =
  | { name: 'home'; lang: Lang }
  | { name: 'project'; lang: Lang; slug: string }
  | { name: 'legal'; lang: Lang; slug: LegalSlug }
  | { name: 'notfound'; lang: Lang };

export const LEGAL_SLUGS = ['privacy', 'legal-notice'] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, ''); // '' or '/repo'

/** Strip the deploy base path and normalise trailing slashes. */
function stripBase(pathname: string): string {
  let p = pathname;
  if (BASE && p.startsWith(BASE)) p = p.slice(BASE.length);
  p = p.replace(/\/index\.html$/, '/').replace(/\/+$/, '');
  return p === '' ? '/' : p;
}

export function parseRoute(pathname: string): Route {
  const parts = stripBase(pathname).split('/').filter(Boolean);
  let lang: Lang = 'en';
  if (parts[0] === 'es') { lang = 'es'; parts.shift(); }
  if (parts.length === 0) return { name: 'home', lang };
  if (parts.length === 1 && (LEGAL_SLUGS as readonly string[]).includes(parts[0]!)) return { name: 'legal', lang, slug: parts[0] as LegalSlug };
  if (parts.length === 2 && parts[0] === 'work' && parts[1]) return { name: 'project', lang, slug: parts[1] };
  return { name: 'notfound', lang };
}

/** Path (without base) for a route — used for hrefs, canonical URLs and the sitemap. */
export function routePath(r: Route): string {
  const prefix = r.lang === 'es' ? '/es' : '';
  if (r.name === 'project') return `${prefix}/work/${r.slug}/`;
  if (r.name === 'legal') return `${prefix}/${r.slug}/`;
  return `${prefix}/`;
}

export function href(path: string, hash?: string): string {
  return `${BASE}${path}${hash ? `#${hash}` : ''}`;
}

interface RouterValue {
  route: Route;
  navigate: (to: string) => void;
}
const RouterContext = createContext<RouterValue | null>(null);

export function RouterProvider({ initialPath, children }: { initialPath: string; children: ReactNode }) {
  const [path, setPath] = useState(initialPath);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to: string) => {
    const url = new URL(to, window.location.href);
    const samePage = url.pathname === window.location.pathname;
    const go = () => {
      if (!samePage) {
        window.history.pushState({}, '', url.pathname + url.hash);
        setPath(url.pathname);
      } else if (url.hash) {
        window.history.pushState({}, '', url.hash);
      }
      // Scroll after React has committed the new page
      requestAnimationFrame(() => {
        const target = url.hash ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : null;
        if (target) target.scrollIntoView();
        else if (!samePage) window.scrollTo({ top: 0, behavior: 'instant' });
        if (!samePage) document.getElementById('main')?.focus({ preventScroll: true });
      });
    };
    // View Transitions where supported; plain swap otherwise
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!samePage && doc.startViewTransition && !reduce) doc.startViewTransition(go);
    else go();
  }, []);

  const value = useMemo(() => ({ route: parseRoute(path), navigate }), [path, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterValue {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used inside <RouterProvider>');
  return ctx;
}

/** Internal link: client-side navigation with normal <a> semantics. */
export function Link({ href: to, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const { navigate } = useRouter();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to);
  };
  return <a href={to} onClick={handle} {...rest} />;
}
