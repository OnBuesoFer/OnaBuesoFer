import { disciplines } from '../../config/disciplines.ts';
import { useL, useT } from '../../lib/i18n.tsx';
import { SectionHead } from '../ui/SectionHead.tsx';

/**
 * Design · Development (DAM) · Systems (ASIR). One coherent practice; every
 * column carries a truthful status (background / studying / certificate / interest).
 */
export function Disciplines() {
  const t = useT();
  const l = useL();
  return (
    <section id="disciplines" className="section disc" data-tone="dark" aria-labelledby="disc-title">
      <div className="wrap">
        <SectionHead
          index="03"
          eyebrow={t.disciplines.eyebrow}
          id="disc-title"
          intro={t.disciplines.intro}
          extra={
            <p className="disc__chain label">
              {t.disciplines.chain.map((c, i) => (
                <span key={c} className="disc__chain-item">
                  {i > 0 && <span className="disc__arrow" aria-hidden="true">→</span>}
                  <span className="disc__chip"><span className="num">0{i + 1}</span> {c}</span>
                </span>
              ))}
            </p>
          }
        >
          {t.disciplines.title.map((line, i) => (
            <span key={i} className="disc__line">{i === 1 ? <em>{line}</em> : line} </span>
          ))}
        </SectionHead>

        <ul className="disc__grid">
          {disciplines.map((d, i) => (
            <li key={d.id} className="disc__col reveal" style={{ ['--d' as string]: `${i * 80}ms` }}>
              <span className="disc__code label num">{d.code}</span>
              <h3 className="disc__name display">{l(d.name)}</h3>
              <p className="disc__full">{l(d.full)}</p>
              <p className="disc__status">
                {d.status.map((s) => (
                  <span key={s} className={`disc__tag disc__tag--${s} label`}>{t.disciplines.status[s]}</span>
                ))}
              </p>
              <p className="disc__areas-label label label--muted">{t.disciplines.areas}</p>
              <ul className="disc__areas">
                {d.areas.map((a, j) => <li key={j}>{l(a)}</li>)}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
