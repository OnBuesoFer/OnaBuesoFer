import { useEffect, useRef, type RefObject } from 'react';
import { useReducedMotion } from '../../hooks/useMediaQuery.ts';
import type { QuantizeField } from '../../js/quantize/engine.ts';

interface Props {
  /** Element that receives pointer / touch input (the hero section). */
  surfaceRef: RefObject<HTMLElement | null>;
  label: string;
}

/**
 * Mounts the framework-agnostic Quantize engine. The engine is loaded as
 * its own chunk after first paint, so it never delays the headline (LCP).
 */
export function QuantizeCanvas({ surfaceRef, label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const surface = surfaceRef.current;
    if (!canvas || !surface) return;
    let field: QuantizeField | null = null;
    let cancelled = false;
    let raf = 0;

    const rel = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top] as const;
    };
    const onMove = (e: PointerEvent) => { const [x, y] = rel(e); field?.setPointer(x, y); };
    const onLeave = (e: PointerEvent) => { if (e.pointerType === 'mouse') field?.releasePointer(); };
    const onUp = (e: PointerEvent) => { if (e.pointerType !== 'mouse') field?.releasePointer(); };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = surface.getBoundingClientRect();
        field?.setProgress(-r.top / (r.height * 0.75));
      });
    };

    import('../../js/quantize/engine.ts')
      .then(({ QuantizeField }) => {
        if (cancelled) return;
        try {
          field = new QuantizeField(canvas, { reducedMotion: reduced });
          canvas.classList.add('is-ready');
          field.start();
          onScroll();
        } catch (err) {
          // Canvas unsupported → the hero simply stays typographic.
          console.warn('[quantize] disabled:', err);
        }
      })
      .catch((err) => console.warn('[quantize] failed to load:', err));

    if (!reduced) {
      surface.addEventListener('pointermove', onMove, { passive: true });
      surface.addEventListener('pointerdown', onMove, { passive: true });
      surface.addEventListener('pointerleave', onLeave);
      surface.addEventListener('pointerup', onUp);
      surface.addEventListener('pointercancel', onUp);
      window.addEventListener('scroll', onScroll, { passive: true });
    }
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      field?.destroy();
      surface.removeEventListener('pointermove', onMove);
      surface.removeEventListener('pointerdown', onMove);
      surface.removeEventListener('pointerleave', onLeave);
      surface.removeEventListener('pointerup', onUp);
      surface.removeEventListener('pointercancel', onUp);
      window.removeEventListener('scroll', onScroll);
    };
  }, [surfaceRef, reduced]);

  return <canvas ref={canvasRef} className="quantize" role="img" aria-label={label} />;
}
