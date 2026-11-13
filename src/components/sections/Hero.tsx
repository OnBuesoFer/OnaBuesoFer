import { site } from '../../config/site.ts';
import { useT } from '../../lib/i18n.tsx';
import { Icon } from '../ui/Icon.tsx';
import { SocialLinks } from '../ui/SocialLinks.tsx';
import { BlueprintCanvas } from './BlueprintCanvas.tsx';

/** Static professional identity — DAM. No rotation, no animation. */
function HeroIdentity() {
  const t = useT();
  const { code, full } = t.hero.identity;
  return (
    <p className="identity">
      <span className="identity__code display">{code}</span>
      <span className="identity__full label">{full}</span>
    </p>
  );
}

export function Hero() {
  const t = useT();
  const [l1, l2, l3] = t.hero.lines;
  const [l2a, ...l2b] = (l2 ?? '').split(' ');

  return (
    <section className="hero" data-tone="light" aria-labelledby="hero-title">
      <div className="hero__grid-lines" aria-hidden="true" />
      <BlueprintCanvas label={t.hero.canvasLabel} />

      <div className="hero__inner wrap">
        <div className="hero__top">
          <p className="hero__id">
            <span className="hero__name display">{site.name}</span>
            <span className="label">{site.title}</span>
          </p>
          <HeroIdentity />
        </div>

        <h1 id="hero-title" className="hero__title display">
          <span className="hero__line"><span>{l1}</span></span>{' '}
          <span className="hero__line hero__line--indent"><span><em>{l2a}</em> {l2b.join(' ')}</span></span>{' '}
          <span className="hero__line"><span>{l3}</span></span>
        </h1>

        <div className="hero__bottom">
          <p className="hero__support">{t.hero.support}</p>
          <a className="btn" href="#work">
            {t.hero.cta}
            <span className="btn__arrow"><Icon name="arrow-down" size={16} /></span>
          </a>
          <SocialLinks className="hero__social" />
        </div>
      </div>
    </section>
  );
}
