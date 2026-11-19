import { useCallback, useEffect, useRef, useState } from 'react';
import { graphicProjects, minSlots, type GraphicProject } from '../../config/graphic.ts';
import { useL, useT } from '../../lib/i18n.tsx';
import { Icon } from '../ui/Icon.tsx';
import { ProjectPicture } from '../ui/ProjectPicture.tsx';
import { SectionHead } from '../ui/SectionHead.tsx';

/**
 * Graphic design gallery. Cards show the cover image; opening a project shows
 * every piece in a viewer (prev/next, arrow keys, swipe, Esc). Images use
 * object-fit: contain in the viewer so they are never cropped or stretched.
 * Content: src/config/graphic.ts.
 */
export function GraphicGallery({ index }: { index: string }) {
  const t = useT();
  const l = useL();
  const g = t.services.graphic;
  const [active, setActive] = useState<{ project: GraphicProject; i: number } | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null); // focus returns here when the viewer closes
  const placeholders = Math.max(0, minSlots - graphicProjects.length);
  const close = useCallback(() => {
    setActive(null);
    requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }));
  }, []);

  return (
    <section id="graphic-design" className="section gfx" data-tone="light" aria-labelledby="gfx-title">
      <div className="wrap">
        <SectionHead index={index} eyebrow={g.eyebrow} id="gfx-title" intro={g.intro}>{g.title}</SectionHead>
        <ul className="gfx__grid">
          {graphicProjects.map((p, n) => (
            <li key={p.id} className="gfx__item reveal" style={{ ['--d' as string]: `${n * 80}ms` }}>
              <button type="button" className="gfx__card" onClick={(e) => { trigger.current = e.currentTarget; setActive({ project: p, i: 0 }); }} aria-haspopup="dialog">
                <span className="gfx__media">
                  <ProjectPicture image={p.images[0]!} className="gfx__img" sizes="(min-width: 1024px) 30vw, (min-width: 768px) 46vw, 92vw" decorative />
                  <span className="gfx__view label"><Icon name="arrow-ne" size={14} /> {g.view}</span>
                </span>
                <span className="gfx__meta">
                  <span className="gfx__title display">{l(p.title)}</span>
                  <span className="gfx__count label label--muted num">
                    {String(p.images.length).padStart(2, '0')} {p.images.length === 1 ? g.piece : g.pieces}
                  </span>
                </span>
                <span className="gfx__desc">{l(p.description)}</span>
              </button>
            </li>
          ))}
          {Array.from({ length: placeholders }, (_, n) => (
            <li key={`slot-${n}`} className="gfx__item gfx__item--empty reveal" style={{ ['--d' as string]: `${(graphicProjects.length + n) * 80}ms` }}>
              <div className="gfx__media gfx__media--empty" role="img" aria-label={g.pendingTitle}>
                <span className="pending">{t.services.services.pending}</span>
              </div>
              <span className="gfx__meta">
                <span className="gfx__title display is-pending">{g.pendingTitle}</span>
              </span>
              <span className="gfx__desc">{g.pendingBody}</span>
            </li>
          ))}
        </ul>
      </div>
      {active && (
        <Viewer
          state={active}
          onChange={setActive}
          onClose={close}
        />
      )}
    </section>
  );
}

function Viewer({ state, onChange, onClose }: {
  state: { project: GraphicProject; i: number };
  onChange: (s: { project: GraphicProject; i: number }) => void;
  onClose: () => void;
}) {
  const t = useT();
  const l = useL();
  const g = t.services.graphic;
  const ref = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const { project, i } = state;
  const n = project.images.length;
  const go = (d: number) => onChange({ project, i: (i + d + n) % n });

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (!d.open) d.showModal();
    document.body.classList.add('is-locked');
    const onClose2 = () => { document.body.classList.remove('is-locked'); onClose(); };
    d.addEventListener('close', onClose2);
    return () => { d.removeEventListener('close', onClose2); document.body.classList.remove('is-locked'); };
  }, [onClose]);

  const onKey = (e: React.KeyboardEvent) => {
    if (n < 2) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  };

  const img = project.images[i]!;
  return (
    <dialog ref={ref} className="viewer" data-tone="dark" aria-labelledby="viewer-title" onKeyDown={onKey}
      onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}>
      <div className="viewer__head">
        <h3 id="viewer-title" className="viewer__title display">{l(project.title)}</h3>
        <span className="label label--muted num">{String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
        <button type="button" className="icon-btn" onClick={() => ref.current?.close()} aria-label={g.close}>
          <Icon name="close" size={18} />
        </button>
      </div>
      <div
        className="viewer__stage"
        onTouchStart={(e) => { touchX.current = e.touches[0]?.clientX ?? null; }}
        onTouchEnd={(e) => {
          const x0 = touchX.current; const x1 = e.changedTouches[0]?.clientX;
          if (x0 != null && x1 != null && Math.abs(x1 - x0) > 40 && n > 1) go(x1 < x0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        <ProjectPicture key={img.file} image={img} className="viewer__img" sizes="90vw" eager />
      </div>
      {n > 1 && (
        <div className="viewer__nav">
          <button type="button" className="icon-btn" onClick={() => go(-1)} aria-label={g.prev}><Icon name="arrow-left" size={18} /></button>
          <ol className="viewer__dots" aria-hidden="true">
            {project.images.map((im, k) => <li key={im.file} className={k === i ? 'is-on' : ''} />)}
          </ol>
          <button type="button" className="icon-btn" onClick={() => go(1)} aria-label={g.next}><Icon name="arrow-right" size={18} /></button>
        </div>
      )}
      <p className="viewer__desc">{l(project.description)}</p>
      <p className="sr-only" aria-live="polite">{l(img.alt)}</p>
    </dialog>
  );
}
