import { legal } from '../config/legal.ts';
import type { LegalSlug } from '../lib/router.tsx';
import { Link, href, routePath } from '../lib/router.tsx';
import { useL, useLang, useT } from '../lib/i18n.tsx';
import { Icon } from '../components/ui/Icon.tsx';

/** Privacy Policy / Legal Notice — simple editorial document page. */
export function LegalPage({ slug }: { slug: LegalSlug }) {
  const doc = legal[slug];
  const l = useL();
  const t = useT();
  const lang = useLang();
  const updated = new Date(`${doc.updated}T00:00:00Z`).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });

  return (
    <article className="legal" data-tone="light" aria-labelledby="legal-title">
      <div className="wrap">
        <Link href={href(routePath({ name: 'home', lang }))} className="case__back label">
          <Icon name="arrow-left" size={14} /> {t.footer.home}
        </Link>
        <h1 id="legal-title" className="legal__title display">{l(doc.title)}</h1>
        <p className="legal__intro">{l(doc.intro)}</p>
        <p className="label label--muted">{t.footer.updated} <time dateTime={doc.updated}>{updated}</time></p>
        <div className="legal__blocks">
          {doc.blocks.map((b, i) => (
            <section key={i} className="legal__block">
              <h2 className="label"><span className="num">{String(i + 1).padStart(2, '0')}</span> {l(b.heading)}</h2>
              <div className="legal__body">
                {b.body.map((p, j) => <p key={j}>{l(p)}</p>)}
                {b.pending?.map((p, j) => <p key={`p${j}`}><span className="pending">{l(p)} — pending</span></p>)}
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
