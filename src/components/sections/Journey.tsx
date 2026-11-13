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
        <SectionHead index="04" eyebrow={t.experience.eyebrow} id="exp-title">{t.experience.title}</SectionHead>
        <ol className="rows">
          {experience.map((e, i) => (
            <li key={e.company} className="row reveal" style={{ ['--d' as string]: `${i * 80}ms` }}>
              <span className="row__meta label num">{e.period}</span>
              <h3 className="row__title display">{e.company}</h3>
              <p className="row__aside">{l(e.role)}</p>
              {e.description && <p className="row__desc">{l(e.description)}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Education — the same row pattern as Experience. No invented institutions or dates. */
export function Education() {
  const t = useT();
  const l = useL();
  return (
    <section id="education" className="section journey journey--tight" data-tone="dark" aria-labelledby="edu-title">
      <div className="wrap">
        <SectionHead index="05" eyebrow={t.education.eyebrow} id="edu-title">{t.education.title}</SectionHead>
        <ol className="rows">
          {education.map((e, i) => (
            <li key={i} className="row reveal" style={{ ['--d' as string]: `${i * 80}ms` }}>
              <span className="row__meta label num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="row__title row__title--s display">{l(e.title)}</h3>
              <p className="row__aside">
                {e.status && <span className="row__tag label">{l(e.status)}</span>}
                {e.specialization && <span>{t.education.specialization}: {l(e.specialization)}</span>}
                {(e.institution || e.period) && <span>{[e.institution, e.period].filter(Boolean).join(' · ')}</span>}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Awards & Events — two quiet sub-sections on the same axis. */
export function Recognition() {
  const t = useT();
  const l = useL();
  return (
    <section id="recognition" className="section journey journey--tight" data-tone="dark" aria-label={`${t.awards.title} · ${t.events.title}`}>
      <div className="wrap recog">
        <div className="subsec">
          <h2 className="subsec__meta label"><span className="num">06</span> <span className="label--muted">{t.awards.title}</span></h2>
          <ul className="rows rows--compact">
            {awards.map((a) => (
              <li key={a.name} className="row reveal">
                <span className="row__title row__title--s display">{a.name}</span>
                <span className="row__aside">
                  {l(a.detail)}
                  {import.meta.env.DEV && a.toConfirm && <span className="pending">To confirm: {l(a.toConfirm)}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="subsec">
          <h2 className="subsec__meta label"><span className="num">07</span> <span className="label--muted">{t.events.title}</span></h2>
          <div>
            <p className="subsec__intro">{t.events.intro}</p>
            <ul className="rows rows--compact">
              {events.map((e) => (
                <li key={e.name} className="row reveal">
                  <span className="row__title row__title--s display">{e.name}</span>
                  <span className="row__aside">{l(e.full)}{e.place ? ` — ${e.place}` : ''}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
