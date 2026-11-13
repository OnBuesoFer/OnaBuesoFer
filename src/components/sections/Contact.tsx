import { useT } from '../../lib/i18n.tsx';
import { SocialLinks } from '../ui/SocialLinks.tsx';

export function Contact() {
  const t = useT();
  return (
    <section id="contact" className="section contact" data-tone="dark" aria-labelledby="contact-title">
      <div className="wrap">
        <p className="contact__eyebrow label"><span className="num">08</span> <span className="label--muted">{t.contact.eyebrow}</span></p>
        <h2 id="contact-title" className="contact__title display reveal">
          {t.contact.title.map((line, i) => (
            <span key={i} className={`contact__line contact__line--${i}`}>{i === 1 ? <em>{line}</em> : line} </span>
          ))}
        </h2>
        <div className="contact__body">
          <p className="contact__support reveal">{t.contact.support}</p>
          <SocialLinks variant="big" className="contact__links reveal" />
        </div>
      </div>
    </section>
  );
}
