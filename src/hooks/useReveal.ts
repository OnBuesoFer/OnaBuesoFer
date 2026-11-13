import { useEffect } from 'react';

/**
 * One shared IntersectionObserver adds `.is-in` to every `.reveal`
 * element. Content stays visible without JS (the `.js` class gates it).
 */
export function useReveal(dep: unknown): void {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal:not(.is-in)');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [dep]);
}
