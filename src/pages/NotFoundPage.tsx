import { Link, href, routePath } from '../lib/router.tsx';
import { useLang, useT } from '../lib/i18n.tsx';

export function NotFoundPage() {
  const t = useT();
  const lang = useLang();
  return (
    <section className="notfound" data-tone="dark" aria-labelledby="nf-title">
      <div className="wrap">
        <p className="notfound__code display num" aria-hidden="true">404</p>
        <h1 id="nf-title" className="notfound__title display">{t.notFound.title}</h1>
        <p>{t.notFound.body}</p>
        <Link className="btn" href={href(routePath({ name: 'home', lang }))}>{t.notFound.home}</Link>
      </div>
    </section>
  );
}
