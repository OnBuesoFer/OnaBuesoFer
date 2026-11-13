import { useRef } from 'react';
import { useT } from '../../lib/i18n.tsx';
import { useReducedMotion } from '../../hooks/useMediaQuery.ts';
import { useScrollProgress } from '../../hooks/useScrollProgress.ts';

const COLS = 24;
const ROWS = 9;

/**
 * PAPER → SCREEN. A stepped pixel field fills with deep green as the
 * band scrolls through the viewport — the moment the site turns from
 * editorial (art) to technical. Pure CSS per cell; JS only writes --p.
 */
export function Bridge() {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useScrollProgress(ref, '--p', reduced);

  const cells = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const n = Math.sin((x + 1) * 12.9898 + (y + 1) * 78.233) * 43758.5453;
      const r = n - Math.floor(n);
      // Bottom rows first, with noise → stepped, organic-to-structured edge
      const thr = 0.18 + (1 - y / (ROWS - 1)) * 0.5 + r * 0.22;
      cells.push(<span key={`${x}-${y}`} style={{ ['--t' as string]: thr.toFixed(3) }} />);
    }
  }

  return (
    <div ref={ref} className="bridge">
      <div className="bridge__top" data-tone="light">
        <p className="wrap bridge__from display" aria-hidden="true">
          {t.bridge.from} <span className="bridge__arrow">↘</span>
        </p>
      </div>
      <div className="bridge__cells" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }} aria-hidden="true">
        {cells}
      </div>
      <div className="bridge__bottom" data-tone="dark">
        <p className="wrap bridge__to">
          <span className="display">{t.bridge.to}</span>
          <span className="label bridge__line">{t.bridge.line}</span>
        </p>
      </div>
    </div>
  );
}
