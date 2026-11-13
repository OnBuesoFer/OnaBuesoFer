import { useState } from 'react';
import { projects } from '../../config/projects.ts';
import { Link, href, routePath } from '../../lib/router.tsx';
import { useL, useLang, useT } from '../../lib/i18n.tsx';
import { Icon } from '../ui/Icon.tsx';
import { PixelPlaceholder } from '../ui/PixelPlaceholder.tsx';
import { ProjectPicture } from '../ui/ProjectPicture.tsx';
import { SectionHead } from '../ui/SectionHead.tsx';
import type { Project } from '../../types/content.ts';

/** Scrolling "browser" frame that pans through a full-page design. */
export function PageFrame({ project, active = true, path }: { project: Project; active?: boolean; path: string }) {
  const t = useT();
  return (
    <div className={`frame ${active ? 'is-active' : ''}`} style={{ ['--ratio' as string]: project.cover ? project.cover.height / project.cover.width : 1 }}>
      <div className="frame__bar" aria-hidden="true">
        <span /><span /><span />
        <span className="frame__url label">{path}</span>
      </div>
      <div className="frame__view">
        {project.cover ? (
          <ProjectPicture image={project.cover} className="frame__img" sizes="(min-width: 1024px) 46vw, 92vw" decorative />
        ) : (
          <PixelPlaceholder label={t.work.pending} seed={project.slug.length} />
        )}
      </div>
    </div>
  );
}

export function WorkIndex() {
  const t = useT();
  const l = useL();
  const lang = useLang();
  const [active, setActive] = useState(0);

  return (
    <section id="work" className="section work" data-tone="light" aria-labelledby="work-title">
      <div className="wrap">
        <SectionHead index="01" eyebrow={t.work.eyebrow} id="work-title" intro={t.work.intro}>
          {t.work.title}
        </SectionHead>

        <div className="work__layout">
          <ol className="work__list">
            {projects.map((p, i) => {
              const to = href(routePath({ name: 'project', lang, slug: p.slug }));
              return (
                <li key={p.slug} className={`work-row reveal ${active === i ? 'is-active' : ''}`} style={{ ['--d' as string]: `${i * 60}ms` }}>
                  <Link
                    href={to}
                    className="work-row__link"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                  >
                    <span className="work-row__num label num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <span className="work-row__title display">{p.title}</span>
                    <span className="work-row__meta">
                      <span className="label">{l(p.category)}</span>
                      <span className="label label--muted">{l(p.type)}{p.year ? ` · ${p.year}` : ''}</span>
                    </span>
                    <span className="work-row__arrow" aria-hidden="true"><Icon name="arrow-ne" size={28} /></span>
                    <span className="sr-only">— {t.work.view}</span>
                  </Link>
                  <div className="work-row__media" aria-hidden="true">
                    <PageFrame project={p} path={`ona/work/${p.slug}`} />
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="work__more">
            <Link href={href(routePath({ name: 'services', lang }))} className="btn">
              {t.services.explore} <span className="btn__arrow"><Icon name="arrow-right" size={16} /></span>
            </Link>
          </div>

          <div className="work__panel" aria-hidden="true">
            <div className="work__sticky">
              {projects.map((p, i) => (
                <div key={p.slug} className={`work__slide ${active === i ? 'is-active' : ''}`}>
                  <PageFrame project={p} active={active === i} path={`ona/work/${p.slug}`} />
                </div>
              ))}
              <p className="work__caption label label--muted">
                <span className="num">{String(active + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
                <span>{t.work.scroll}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
