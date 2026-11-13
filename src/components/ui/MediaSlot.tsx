import type { MediaSlot as Slot } from '../../config/services.ts';
import { useL, useT } from '../../lib/i18n.tsx';
import { ProjectPicture } from './ProjectPicture.tsx';

/**
 * Framed image slot with a fixed ratio. Shows the real image when one is
 * configured; otherwise a clearly marked placeholder with crop marks —
 * ready for future photography without changing the layout.
 */
export function MediaSlot({ slot, className = '' }: { slot: Slot; className?: string }) {
  const l = useL();
  const t = useT();
  return (
    <figure className={`media-slot ${className}`}>
      <div
        className="media-slot__frame"
        style={{ aspectRatio: slot.ratio === 'auto' ? (slot.image ? `${slot.image.width} / ${slot.image.height}` : '1 / 1') : slot.ratio }}
      >
        {slot.image ? (
          <ProjectPicture image={slot.image} className="media-slot__img" sizes="(min-width: 1024px) 50vw, 100vw" />
        ) : (
          <div className="media-slot__empty" role="img" aria-label={`${t.services.services.pending} — ${l(slot.caption)}`}>
            <span className="media-slot__mark media-slot__mark--tl" aria-hidden="true" />
            <span className="media-slot__mark media-slot__mark--tr" aria-hidden="true" />
            <span className="media-slot__mark media-slot__mark--bl" aria-hidden="true" />
            <span className="media-slot__mark media-slot__mark--br" aria-hidden="true" />
            <span className="pending">{t.services.services.pending}{slot.ratio !== 'auto' ? ` · ${slot.ratio.replace('/', ':')}` : ''}</span>
          </div>
        )}
      </div>
      <figcaption className="media-slot__caption label label--muted">{l(slot.caption)}</figcaption>
    </figure>
  );
}
