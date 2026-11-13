import { useEffect, type RefObject } from 'react';

/**
 * Writes the element's scroll progress (0 → 1 while it crosses the
 * viewport) into a CSS custom property, without re-rendering React.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, prop = '--p', disabled = false): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (disabled) { el.style.setProperty(prop, '0.62'); return; }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      el.style.setProperty(prop, p.toFixed(4));
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
  }, [ref, prop, disabled]);
}
