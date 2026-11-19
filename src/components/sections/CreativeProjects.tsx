import { useState } from 'react';
import { creativeProjects } from '../../config/creative.ts';
import { useL, useT } from '../../lib/i18n.tsx';
import { ProjectPicture } from '../ui/ProjectPicture.tsx';
import { SectionHead } from '../ui/SectionHead.tsx';

/**
 * Creative Projects & Exploration (Projects & Services page). Four personal projects; each card has
 * a visual, a title and a «+» toggle that reveals / hides its description.
 * Content lives in src/config/creative.ts.
 */
export function CreativeProjects({ index, tone = 'light' }: { index: string; tone?: 'light' | 'dark' }) {
  const t = useT();
  const l = useL();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <section id="creative" className="section creative" data-tone={tone} aria-labelledby="creative-title">
      <div className="wrap">
        <SectionHead index={index} eyebrow={t.creative.eyebrow} id="creative-title" intro={t.creative.intro}>
          {t.creative.title}
        </SectionHead>

        <ul className="creative__grid">
          {creativeProjects.map((p, i) => {
            const isOpen = Boolean(open[p.id]);
            const title = p.title ? l(p.title) : t.creative.pendingTitle;
            const panelId = `${p.id}-desc`;
            return (
              <li key={p.id} className={`creative__item reveal ${isOpen ? 'is-open' : ''}`} style={{ ['--d' as string]: `${i * 80}ms` }}>
                <div className="creative__media">
                  {p.image ? (
                    <ProjectPicture image={p.image} mode="poster" className="creative__img" sizes="(min-width: 1024px) 34vw, 92vw" />
                  ) : (
                    <div className="creative__empty" role="img" aria-label={`${t.creative.pendingImage} — ${String(i + 1).padStart(2, '0')}`}>
                      <span className="pending">{t.creative.pendingImage}</span>
                    </div>
                  )}
                </div>
                <div className="creative__bar">
                  <span className="creative__num label num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className={`creative__title display ${p.title ? '' : 'is-pending'}`}>{title}</h3>
                  <button
                    type="button"
                    className="creative__toggle"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    aria-label={`${isOpen ? t.creative.close : t.creative.open}: ${title}`}
                    onClick={() => setOpen((o) => ({ ...o, [p.id]: !o[p.id] }))}
                  >
                    <span className="creative__plus" aria-hidden="true" />
                  </button>
                </div>
                <div id={panelId} className="creative__panel" role="region" aria-label={title}>
                  <div className="creative__panel-inner">
                    <p className="creative__desc">{p.description ? l(p.description) : t.creative.pendingBody}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
