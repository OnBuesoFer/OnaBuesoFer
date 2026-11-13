import { services, servicesPage, workCategories } from '../config/services.ts';
import { site } from '../config/site.ts';
import { Link, href, routePath } from '../lib/router.tsx';
import { useL, useLang, useT } from '../lib/i18n.tsx';
import { Icon } from '../components/ui/Icon.tsx';
import { MediaSlot } from '../components/ui/MediaSlot.tsx';
import { ProjectPicture } from '../components/ui/ProjectPicture.tsx';
import { SectionHead } from '../components/ui/SectionHead.tsx';
import { SocialLinks } from '../components/ui/SocialLinks.tsx';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Projects & Services. Photography and digital design are the main
 * offering; development, systems and data are presented as complementary.
 * All content comes from src/config/services.ts.
 */
export function ServicesPage() {
  const t = useT();
  const l = useL();
  const lang = useLang();
  const s = t.services;
  const home = routePath({ name: 'home', lang });

  const published = workCategories.filter((c) => c.projects.length > 0 || c.seeAlso).length;
  const total = workCategories.length;
  const updated = new Date(`${servicesPage.updated}T00:00:00Z`).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });
  // Primary CTA → the first social profile that actually exists.
  const primary = (['instagram', 'linkedin', 'github'] as const)
    .map((id) => site.social.find((x) => x.id === id))
    .find((x) => x?.href);

  return (
    <div className="svc">
      {/* 01 — Introduction */}
      <section className="svc-intro" data-tone="light" aria-labelledby="svc-title">
        <div className="wrap">
          <Link href={href(home)} className="case__back label">
            <Icon name="arrow-left" size={14} /> {s.back}
          </Link>
          <div className="svc-intro__grid">
            <p className="svc-intro__meta label" aria-hidden="true">
              <span className="num">01</span> <span className="label--muted">{s.intro.eyebrow}</span>
            </p>
            <h1 id="svc-title" className="svc-intro__title display">
              <span className="sr-only">{s.title}: </span>
              {servicesPage.intro.lines[lang].map((line, i) => (
                <span key={i} className={`svc-intro__line svc-intro__line--${i}`}>{i === 1 ? <em>{line}</em> : line} </span>
              ))}
            </h1>
            <p className="svc-intro__body reveal">{l(servicesPage.intro.body)}</p>
            <div className="svc-intro__aside reveal">
              <p className="label label--muted">{s.intro.complementary}</p>
              <ul className="svc-intro__chips">
                {servicesPage.intro.complementary[lang].map((c) => <li key={c} className="label">{c}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 02 — Services */}
      <section id="services" className="section svc-services" data-tone="light" aria-labelledby="svc-services-title">
        <div className="wrap">
          <SectionHead index="02" eyebrow={s.services.eyebrow} id="svc-services-title">{s.services.title}</SectionHead>
          {services.map((sv, i) => (
            <article key={sv.id} className={`service service--${i % 2 ? 'b' : 'a'}`} aria-labelledby={sv.name ? `service-${sv.id}` : `service-${sv.id}-statement`}>
              <header className="service__head">
                <p className="service__meta label" aria-hidden="true">
                  <span className="num">{pad(i + 1)}</span> <span className="service__code">{sv.code}</span>
                </p>
                {sv.name && <h3 id={`service-${sv.id}`} className="service__name display reveal">{l(sv.name)}</h3>}
                <p id={`service-${sv.id}-statement`} className="service__statement reveal">{l(sv.statement)}</p>
              </header>
              <div className="service__media">
                {sv.media.map((m, j) => <MediaSlot key={j} slot={m} className={`service__slot service__slot--${j}`} />)}
              </div>
              <div className="service__offer">
                <p className="service__offer-label label label--muted">{s.services.offer}</p>
                <ol className="service__list">
                  {sv.offerings.map((o, j) => (
                    <li key={j}><span className="num label" aria-hidden="true">{pad(j + 1)}</span> {l(o)}</li>
                  ))}
                </ol>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 03 — Additional work */}
      <section id="more-work" className="section svc-work" data-tone="light" aria-labelledby="svc-work-title">
        <div className="wrap">
          <SectionHead index="03" eyebrow={s.work.eyebrow} id="svc-work-title" intro={s.work.intro}>{s.work.title}</SectionHead>
          <ol className="rows">
            {workCategories.map((c, i) => (
              <li key={c.id} className="row svc-work__row reveal">
                <span className="row__meta label num">{pad(i + 1)}</span>
                <h3 className="row__title row__title--s display">{l(c.name)}</h3>
                <p className="row__aside">
                  {c.projects.length > 0 && <span className="label">{pad(c.projects.length)} {s.work.projects}</span>}
                  {c.seeAlso && (
                    <Link href={href(home, c.seeAlso.anchor)} className="svc-work__see label">
                      {s.work.see} {l(c.seeAlso.label)} <Icon name="arrow-ne" size={12} />
                    </Link>
                  )}
                  {c.projects.length === 0 && !c.seeAlso && <span className="svc-work__state label">{s.work.preparing}</span>}
                </p>
                {c.projects.length > 0 && (
                  <ul className="svc-work__items">
                    {c.projects.map((p) => (
                      <li key={p.title} className="svc-work__item">
                        <div className="svc-work__thumb">
                          {p.image ? <ProjectPicture image={p.image} mode="poster" sizes="(min-width: 1024px) 30vw, 90vw" /> : <span className="pending">{s.services.pending}</span>}
                        </div>
                        <p className="svc-work__title display">{p.title}{p.year ? <span className="label label--muted"> · {p.year}</span> : null}</p>
                        <p className="svc-work__desc">{l(p.description)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 04 — Under construction */}
      <section className="section soon" data-tone="dark" aria-labelledby="soon-title">
        <div className="soon__grid" aria-hidden="true" />
        <div className="wrap soon__inner">
          <p className="soon__meta label"><span className="num">04</span> <span className="label--muted">{s.soon.eyebrow}</span></p>
          <h2 id="soon-title" className="soon__title display">
            {s.soon.lines.map((line, i) => <span key={i} className={`soon__line soon__line--${i}`}>{i === 1 ? <em>{line}</em> : line} </span>)}
          </h2>
          <p className="soon__body">{s.soon.body}</p>
          <dl className="soon__status">
            <div className="soon__cell soon__cell--wide">
              <dt className="label label--muted">{s.soon.published}</dt>
              <dd>
                <span className="soon__count num">{pad(published)} / {pad(total)}</span>
                <span className="soon__bar" role="img" aria-label={`${published} / ${total}`}>
                  {workCategories.map((c, i) => <span key={c.id} className={i < published ? 'is-on' : ''} />)}
                </span>
              </dd>
            </div>
            <div className="soon__cell">
              <dt className="label label--muted">{s.soon.updated}</dt>
              <dd className="num"><time dateTime={servicesPage.updated}>{updated}</time></dd>
            </div>
            <div className="soon__cell">
              <dt className="label label--muted">{s.soon.eyebrow}</dt>
              <dd className="soon__state"><span className="px" aria-hidden="true" /> {s.soon.state}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* 05 — Contact (social media first) */}
      <section className="section contact svc-contact" data-tone="dark" aria-labelledby="svc-contact-title">
        <div className="wrap">
          <p className="contact__eyebrow label"><span className="num">05</span> <span className="label--muted">{s.contact.eyebrow}</span></p>
          <h2 id="svc-contact-title" className="svc-contact__title display">
            {s.contact.lines.map((line, i) => <span key={i} className="svc-contact__line">{i === 1 ? <em>{line}</em> : line} </span>)}
          </h2>
          <div className="contact__body">
            <div className="contact__support svc-contact__support">
              <p>{s.contact.body}</p>
              {primary ? (
                <a className="btn" href={primary.href!} target="_blank" rel="noopener noreferrer">
                  {s.contact.cta} <span className="btn__arrow"><Icon name="arrow-ne" size={16} /></span>
                  <span className="sr-only"> ({t.a11y.external})</span>
                </a>
              ) : (
                <span className="btn btn--ghost is-pending" aria-disabled="true">
                  {s.contact.cta} <span className="pending">Pending</span>
                </span>
              )}
            </div>
            <SocialLinks variant="big" className="contact__links" exclude={['email']} />
          </div>
        </div>
      </section>
    </div>
  );
}
