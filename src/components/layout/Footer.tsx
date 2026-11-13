import { useEffect, useRef, useState } from 'react';
import { site } from '../../config/site.ts';
import { useLang, useT } from '../../lib/i18n.tsx';
import { Link, href, routePath } from '../../lib/router.tsx';
import { Icon } from '../ui/Icon.tsx';

/**
 * Editorial footer: technical top bar with scroll progress, contact block,
 * link + social columns, legal bar and an oversized GEMINISOBF.DEV signature
 * cropped by the bottom edge.
 */
export function Footer() {
  const t = useT();
  const lang = useLang();
  const ref = useRef<HTMLElement>(null);
  // Dynamic year — computed on the client so a pre-rendered page never goes stale.
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => setYear(new Date().getFullYear()), []);

  // Page scroll progress → --progress (0..1) on the top line. No re-renders.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.setProperty('--progress', max > 0 ? (window.scrollY / max).toFixed(4) : '1');
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const home = routePath({ name: 'home', lang });
  const links = [
    { label: t.footer.home, to: href(home) },
    { label: t.nav.about, to: href(home, 'about') },
    { label: t.footer.projects, to: href(home, 'work') },
    { label: t.nav.experience, to: href(home, 'experience') },
    { label: t.nav.contact, to: href(home, 'contact') },
  ];
  // Only platforms with a real profile URL are listed (never placeholders here).
  const social = site.social.filter((s) => s.id !== 'email' && s.href);
  const email = site.social.find((s) => s.id === 'email')?.href ?? null;

  return (
    <footer ref={ref} className="site-footer" data-tone="black">
      <div className="wrap">
        {/* Top technical bar */}
        <div className="site-footer__bar label">
          <span>{site.brand} — {t.footer.signature}</span>
          <span className="site-footer__progress" role="presentation" aria-hidden="true" title={t.footer.progress}><span /></span>
          <a href="#top" className="site-footer__top">
            {t.footer.status} <span aria-hidden="true">·</span> {t.footer.top} <Icon name="arrow-up" size={12} />
          </a>
        </div>

        <div className="site-footer__main">
          {/* Contact block (replaces a newsletter: no fake forms) */}
          <section className="site-footer__contact" aria-labelledby="footer-contact">
            <p className="site-footer__eyebrow label">{t.footer.eyebrow}</p>
            <h2 id="footer-contact" className="site-footer__title display">{t.footer.title}</h2>
            {email ? (
              <a className="site-footer__field" href={email}>
                <span className="site-footer__field-text">{email.replace(/^mailto:/, '')}</span>
                <span className="site-footer__field-cta">
                  <span className="sr-only">{t.footer.emailCta}</span>
                  <Icon name="arrow-ne" size={22} />
                </span>
              </a>
            ) : (
              <div className="site-footer__field is-pending" aria-disabled="true">
                <span className="site-footer__field-text">{t.footer.emailPending}</span>
                <span className="pending">Pending</span>
              </div>
            )}
            <span className="site-footer__field-line" aria-hidden="true" />
          </section>

          <nav className="site-footer__col" aria-labelledby="footer-links">
            <h2 id="footer-links" className="site-footer__eyebrow label">{t.footer.links}</h2>
            <ul className="site-footer__links">
              {links.map((x) => (
                <li key={x.label}><Link href={x.to} className="site-footer__link">{x.label}</Link></li>
              ))}
            </ul>
          </nav>

          {(social.length > 0 || import.meta.env.DEV) && (
            <div className="site-footer__col">
              <h2 className="site-footer__eyebrow label">{t.footer.social}</h2>
              {social.length > 0 ? (
                <ul className="site-footer__social">
                  {social.map((s) => (
                    <li key={s.id}>
                      <a href={s.href!} target="_blank" rel="noopener noreferrer" aria-label={`${s.label} (${t.a11y.external})`} className="site-footer__icon">
                        <Icon name={s.id} size={22} />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="pending">Dev only: add URLs in site.ts</span>
              )}
            </div>
          )}
        </div>

        {/* Legal bar */}
        <div className="site-footer__legal">
          <ul className="site-footer__legal-links">
            <li><Link href={href(routePath({ name: 'legal', lang, slug: 'privacy' }))}>{t.footer.privacy}</Link></li>
            <li><Link href={href(routePath({ name: 'legal', lang, slug: 'legal-notice' }))}>{t.footer.legalNotice}</Link></li>
          </ul>
          <p>© <span className="num">{year ?? ''}</span> {site.brand}</p>
        </div>
      </div>

      {/* Oversized signature — cropped by the footer's bottom edge */}
      <div className="site-footer__sig reveal" aria-hidden="true">
        <span>{site.brand}</span>
      </div>
    </footer>
  );
}
