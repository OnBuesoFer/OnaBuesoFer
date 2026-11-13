import { awards, education, events, experience } from '../../config/profile.ts';
import { useL, useT } from '../../lib/i18n.tsx';
import { SectionHead } from '../ui/SectionHead.tsx';

/** Experience — editorial timeline. */
export function Experience() {
  const t = useT();
  const l = useL();
  return (
    <section id="experience" className="section journey" data-tone="dark" aria-labelledby="exp-title">
      <div className="wrap">
        <SectionHead index="03" eyebrow={t.experience.eyebrow} id="exp-title">{t.experience.title}</SectionHead>
        <ol className="timeline">
          {experience.map((e, i) => (
            <li key={e.company} className="timeline__row reveal" style={{ ['--d' as string]: `${i * 80}ms` }}>
              <span className="timeline__period label num">{e.period}</span>
              <h3 className="timeline__company display">{e.company}</h3>
              <p className="timeline__role">{l(e.role)}</p>
              {e.description && <p className="timeline__desc">{l(e.description)}</p>}
              <span className="timeline__node" aria-hidden="true" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Education — numbered list, no invented institutions or dates. */
export function Education() {
  const t = useT();
  const l = useL();
  return (
    <section id="education" className="section journey journey--tight" data-tone="dark" aria-labelledby="edu-title">
      <div className="wrap">
        <SectionHead index="04" eyebrow={t.education.eyebrow} id="edu-title">{t.education.title}</SectionHead>
        <ol className="edu">
          {education.map((e, i) => (
            <li key={i} className="edu__item reveal" style={{ ['--d' as string]: `${i * 80}ms` }}>
              <span className="edu__num display num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="edu__title">{l(e.title)}</h3>
              {e.specialization && (
                <p className="edu__spec label">
                  <span className="px" aria-hidden="true" /> {t.education.specialization}: {l(e.specialization)}
                </p>
              )}
              {e.status && (
                <p className="edu__spec label">
                  <span className="px" aria-hidden="true" /> {l(e.status)}
                </p>
              )}
              {(e.institution || e.period) && (
                <p className="label label--muted">{[e.institution, e.period].filter(Boolean).join(' · ')}</p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Awards & Events — subtle editorial index side by side. */
export function Recognition() {
  const t = useT();
  const l = useL();
  return (
    <section id="recognition" className="section journey journey--tight" data-tone="dark" aria-label={`${t.awards.title} · ${t.events.title}`}>
      <div className="wrap recog">
        <div className="recog__col">
          <h2 className="recog__head label"><span className="num">05</span> <span className="label--muted">{t.awards.title}</span></h2>
          <ul className="recog__list">
            {awards.map((a) => (
              <li key={a.name} className="recog__item reveal">
                <span className="recog__name display">{a.name}</span>
                <span className="recog__detail">{l(a.detail)}</span>
                {import.meta.env.DEV && a.toConfirm && <span className="pending">To confirm: {l(a.toConfirm)}</span>}
              </li>
            ))}
          </ul>
        </div>
        <div className="recog__col">
          <h2 className="recog__head label"><span className="num">06</span> <span className="label--muted">{t.events.title}</span></h2>
          <p className="recog__intro">{t.events.intro}</p>
          <ul className="recog__list">
            {events.map((e) => (
              <li key={e.name} className="recog__item reveal">
                <span className="recog__name display">{e.name}</span>
                <span className="recog__detail">{l(e.full)}{e.place ? ` — ${e.place}` : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
