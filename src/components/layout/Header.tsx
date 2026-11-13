import { useEffect, useRef, useState } from 'react';
import { Link, href, routePath, useRouter } from '../../lib/router.tsx';
import { useLang, useT } from '../../lib/i18n.tsx';
import { useGame } from '../../lib/game.tsx';
import { useActiveSection } from '../../hooks/useActiveSection.ts';
import { useHeaderTone } from '../../hooks/useHeaderTone.ts';
import { Logo } from './Logo.tsx';
import { SocialLinks } from '../ui/SocialLinks.tsx';
import { site } from '../../config/site.ts';

const SECTIONS = ['work', 'about', 'experience', 'contact'] as const;

export function Header() {
  const t = useT();
  const lang = useLang();
  const { route } = useRouter();
  const game = useGame();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const isHome = route.name === 'home';
  const active = useActiveSection(SECTIONS, isHome);
  const tone = useHeaderTone(route);
  const home = routePath({ name: 'home', lang });
  const other = lang === 'en' ? 'es' : 'en';
  const switchPath = routePath({ ...route, lang: other } as typeof route);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mobile menu: lock scroll, focus first link, close on Escape
  useEffect(() => {
    if (!open) return;
    document.body.classList.add('is-locked');
    menuRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('is-locked');
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => setOpen(false), [route]);

  const close = () => setOpen(false);

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`} data-tone={open ? 'dark' : tone}>
      <div className="site-header__bar wrap">
        <Link href={href(home)} className="site-header__logo" aria-label={`${site.name} — home`} onClick={close}>
          <Logo />
        </Link>

        <p className="site-header__role label" aria-hidden="true">{site.title}</p>

        <div className={`site-nav ${open ? 'is-open' : ''}`} ref={menuRef} id="site-nav">
          <nav aria-label={t.a11y.mainNav}>
            <ul className="site-nav__list">
              {SECTIONS.map((id, i) => (
                <li key={id}>
                  <Link
                    href={href(home, id)}
                    className={`site-nav__link ${active === id ? 'is-active' : ''}`}
                    aria-current={active === id ? 'location' : undefined}
                    onClick={close}
                  >
                    <span className="site-nav__num num" aria-hidden="true">0{i + 1}</span>
                    <span>{t.nav[id]}</span>
                  </Link>
                </li>
              ))}
              <li>
                <button type="button" className="site-nav__play" onClick={() => { close(); game.open(); }} aria-haspopup="dialog">
                  <span className="px" aria-hidden="true" />
                  {t.nav.play}
                </button>
              </li>
            </ul>
          </nav>
          <a className="site-nav__lang label" href={href(switchPath)} hrefLang={other} lang={other} aria-label={t.meta.switchLabel}>
            <span className={lang === 'en' ? 'is-current' : ''}>EN</span>
            <span aria-hidden="true">/</span>
            <span className={lang === 'es' ? 'is-current' : ''}>ES</span>
          </a>
          <div className="site-nav__social">
            <SocialLinks variant="stack" />
          </div>
        </div>

        <button
          ref={toggleRef}
          type="button"
          className="site-header__toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">{open ? t.a11y.closeMenu : t.a11y.menu}</span>
          <span className="burger" aria-hidden="true"><span /><span /></span>
        </button>
      </div>
    </header>
  );
}
