import { Logo } from './Logo.tsx';

/**
 * Intro: the brand logo builds from a pixel grid, then the curtain steps away.
 * Pure CSS (no JS timing) so it never blocks rendering or interaction.
 * Skipped on repeat visits and with reduced motion via a tiny inline
 * script in index.html (adds `.no-intro` to <html>).
 */
export function Preloader() {
  const cells = Array.from({ length: 48 }, (_, i) => i);
  return (
    <div className="intro" aria-hidden="true" data-tone="dark">
      <div className="intro__grid">
        {cells.map((i) => (
          <span key={i} style={{ ['--i' as string]: (i * 37) % 48 }} />
        ))}
      </div>
      <div className="intro__word">
        <Logo />
      </div>
      <p className="intro__meta label">
        <span>Art</span>
        <span className="intro__bar"><span /></span>
        <span>Technology</span>
      </p>
    </div>
  );
}
