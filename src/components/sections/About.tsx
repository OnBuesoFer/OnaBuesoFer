import { useState } from 'react';
import { useT } from '../../lib/i18n.tsx';
import { SectionHead } from '../ui/SectionHead.tsx';
import { ArtTechDiagram } from './ArtTechDiagram.tsx';
import { Logo } from '../layout/Logo.tsx';

export function About() {
  const t = useT();
  const [focus, setFocus] = useState<'art' | 'tech' | null>(null);
  const [first, ...rest] = t.about.paragraphs;

  return (
    <section id="about" className="section about" data-tone="light" aria-labelledby="about-title">
      <div className="wrap">
        <SectionHead index="02" eyebrow={t.about.eyebrow} id="about-title">
          {t.about.title}
        </SectionHead>

        <div className="about__grid">
          <figure className="about__photo reveal">
            {/* PHOTO PENDING — add a portrait to src/media/ and replace this block */}
            <div className="about__photo-box">
              <span className="about__photo-mark" aria-hidden="true"><Logo /></span>
              <span className="pending">{t.about.photo}</span>
            </div>
          </figure>

          <div className="about__text">
            <p className="about__lead display reveal">{first}</p>
            {rest.map((p, i) => (
              <p key={i} className="about__p reveal" style={{ ['--d' as string]: `${(i + 1) * 80}ms` }}>{p}</p>
            ))}
          </div>
        </div>

        <div className="about__converge">
          <ul className="about__side about__side--art reveal" onMouseEnter={() => setFocus('art')} onMouseLeave={() => setFocus(null)}>
            <li className="about__side-title display"><em>{t.about.art}</em></li>
            {t.about.artItems.map((x) => <li key={x} className="label">{x}</li>)}
          </ul>
          <ArtTechDiagram focus={focus} label={t.about.diagramLabel} />
          <ul className="about__side about__side--tech reveal" onMouseEnter={() => setFocus('tech')} onMouseLeave={() => setFocus(null)}>
            <li className="about__side-title display">{t.about.tech}</li>
            {t.about.techItems.map((x) => <li key={x} className="label">{x}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
