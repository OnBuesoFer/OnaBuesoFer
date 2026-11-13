import { useEffect, useState } from 'react';

type Tone = 'light' | 'dark' | 'black';

/**
 * Reads the data-tone of whatever sits under the fixed header so the
 * header always contrasts with the surface behind it.
 */
export function useHeaderTone(dep: unknown): Tone {
  const [tone, setTone] = useState<Tone>('light');
  useEffect(() => {
    let raf = 0;
    const probe = () => {
      raf = 0;
      const y = 30;
      const els = document.elementsFromPoint(window.innerWidth / 2, y);
      for (const el of els) {
        if (el.closest('.site-header')) continue;
        const t = (el.closest('[data-tone]') as HTMLElement | null)?.dataset.tone as Tone | undefined;
        if (t) { setTone(t); return; }
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(probe); };
    probe();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [dep]);
  return tone;
}
