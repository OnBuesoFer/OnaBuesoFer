import { useEffect } from 'react';

/**
 * One shared IntersectionObserver marks every `.reveal` element with a
 * `data-in` attribute once it enters the viewport. An attribute (not a class)
 * is used on purpose: React rewrites `className` when a component re-renders
 * (e.g. a project row becoming active on hover), which would wipe an
 * imperatively added class and hide the element again. Content stays visible
 * without JS (the `.js` class gates the hidden state).
 */
export function useReveal(dep: unknown): void {
  useEffect(() => {
    const scan = () => document.querySelectorAll<HTMLElement>('.reveal:not([data-in])');
    if (!('IntersectionObserver' in window)) {
      scan().forEach((el) => el.setAttribute('data-in', ''));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute('data-in', '');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    scan().forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [dep]);
}
