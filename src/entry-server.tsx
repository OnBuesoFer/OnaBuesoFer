import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './App.tsx';
import { headFor, headHtml } from './lib/head.ts';
import { parseRoute } from './lib/router.tsx';

export { projects } from './config/projects.ts';
export { site } from './config/site.ts';
export { LEGAL_SLUGS, SERVICES_SLUG } from './lib/router.tsx';

/** Used by scripts/prerender.ts to produce static HTML for every route. */
export function render(pathname: string, basePath: string) {
  const route = parseRoute(pathname);
  const html = renderToString(
    <StrictMode>
      <App initialPath={pathname} />
    </StrictMode>,
  );
  const head = headFor(route);
  return { html, head: headHtml(head, basePath), lang: head.lang };
}
