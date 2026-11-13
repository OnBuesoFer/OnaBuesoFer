import { useEffect, useRef } from 'react';
import type { SystemBlueprint } from '../../js/blueprint/blueprint.ts';

/**
 * Static system blueprint behind the hero. No animation loop and no scroll
 * or pointer listeners: it renders once (and again only on resize). The
 * module loads as its own chunk after first paint so it never delays the
 * headline.
 */
export function BlueprintCanvas({ label }: { label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let bp: SystemBlueprint | null = null;
    let cancelled = false;
    // Labels are drawn in DM Sans — wait for it briefly (capped).
    const fontsReady = Promise.race([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((r) => setTimeout(r, 600)),
    ]);
    Promise.all([import('../../js/blueprint/blueprint.ts'), fontsReady])
      .then(([{ SystemBlueprint }]) => {
        if (cancelled) return;
        try {
          bp = new SystemBlueprint(canvas);
          canvas.classList.add('is-ready');
        } catch (err) {
          console.warn('[blueprint] disabled:', err); // the hero stays typographic
        }
      })
      .catch((err) => console.warn('[blueprint] failed to load:', err));
    return () => { cancelled = true; bp?.destroy(); };
  }, []);

  return <canvas ref={ref} className="quantize" role="img" aria-label={label} />;
}
