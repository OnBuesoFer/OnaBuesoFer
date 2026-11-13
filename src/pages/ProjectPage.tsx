import { getNeighbours, getProject } from '../config/projects.ts';
import { Link, href, routePath } from '../lib/router.tsx';
import { useL, useLang, useT } from '../lib/i18n.tsx';
import { Icon } from '../components/ui/Icon.tsx';
import { ProjectPicture } from '../components/ui/ProjectPicture.tsx';
import { PixelPlaceholder } from '../components/ui/PixelPlaceholder.tsx';
import { NotFoundPage } from './NotFoundPage.tsx';

/**
 * Case study. Renders only what exists in projects.ts — optional sections
 * (context, challenge, process, design system, gallery, credits) appear
 * automatically once they are added to the data file.
 */
export function ProjectPage({ slug }: { slug: string }) {
  const t = useT();
  const l = useL();
  const lang = useLang();
  const project = getProject(slug);
  if (!project) return <NotFoundPage />;
  const { prev, next } = getNeighbours(slug);
  const home = routePath({ name: 'home', lang });
  const p = project;

  return (
    <article className="case" data-tone="light" aria-labelledby="case-title">
      <header className="case__head wrap">
        <Link href={href(home, 'work')} className="case__back label">
          <Icon name="arrow-left" size={14} /> {t.project.back}
        </Link>
        <h1 id="case-title" className="case__title display">{p.title}</h1>
        <dl className="case__meta">
          <div><dt className="label label--muted">{t.project.category}</dt><dd>{l(p.category)}</dd></div>
          <div><dt className="label label--muted">{t.project.type}</dt><dd>{l(p.type)}</dd></div>
          {p.year && <div><dt className="label label--muted">{t.project.year}</dt><dd className="num">{p.year}</dd></div>}
        </dl>
      </header>

      <section className="case__overview wrap" aria-labelledby="ov-title">
        <h2 id="ov-title" className="label"><span className="px" aria-hidden="true" /> {t.project.overview}</h2>
        <p className="case__summary display">{l(p.summary)}</p>
        {import.meta.env.DEV && p.summary.draft && <span className="pending">Draft copy — review</span>}
      </section>

      {p.sections?.map((s, i) => (
        <section key={i} className="case__section wrap">
          <h2 className="label"><span className="num">{String(i + 1).padStart(2, '0')}</span> {l(s.title)}</h2>
          <p className="case__body">{l(s.body)}</p>
          {s.images?.map((img) => <ProjectPicture key={img.file} image={img} className="case__img" sizes="(min-width: 1280px) 1200px, 100vw" />)}
        </section>
      ))}

      <section className="case__result" data-tone="dark" aria-labelledby="res-title">
        <div className="wrap">
          <h2 id="res-title" className="case__result-head">
            <span className="label">{t.project.result}</span>
            <span className="label label--muted">{t.project.fullPage}</span>
          </h2>
          <div className="case__reel">
            {p.cover ? (
              <ProjectPicture image={p.cover} eager sizes="(min-width: 1360px) 1200px, 92vw" />
            ) : (
              <div className="case__pending">
                <PixelPlaceholder label={t.project.pendingTitle} seed={p.slug.length} />
                <p>{t.project.pendingBody}</p>
              </div>
            )}
          </div>
          {p.gallery && (
            <div className="case__gallery">
              {p.gallery.map((img) => <ProjectPicture key={img.file} image={img} sizes="(min-width: 1024px) 45vw, 92vw" />)}
            </div>
          )}
          {p.credits && <p className="case__credits"><span className="label">{t.project.credits}</span> {l(p.credits)}</p>}
          {p.brandConcept && <p className="case__disclaimer label label--muted">{t.project.concept(p.brandConcept)}</p>}
        </div>
      </section>

      <nav className="case__pager" data-tone="black" aria-label={`${t.project.prev} / ${t.project.next}`}>
        <Link href={href(routePath({ name: 'project', lang, slug: prev.slug }))} className="case__pager-link" rel="prev">
          <span className="label label--muted"><Icon name="arrow-left" size={14} /> {t.project.prev}</span>
          <span className="display">{prev.title}</span>
        </Link>
        <Link href={href(routePath({ name: 'project', lang, slug: next.slug }))} className="case__pager-link case__pager-link--next" rel="next">
          <span className="label label--muted">{t.project.next} <Icon name="arrow-right" size={14} /></span>
          <span className="display">{next.title}</span>
        </Link>
      </nav>
    </article>
  );
}
