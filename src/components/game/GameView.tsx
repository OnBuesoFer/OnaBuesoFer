import { useEffect, useRef, useState } from 'react';
import { DesignerSurvival, H, W, type GameSnapshot } from '../../js/game/engine.ts';
import { useT } from '../../lib/i18n.tsx';
import { useCoarsePointer, useReducedMotion } from '../../hooks/useMediaQuery.ts';
import { Icon } from '../ui/Icon.tsx';

const MUTE_KEY = 'ona-designer-survival-muted';

function readMuted(): boolean {
  try { return localStorage.getItem(MUTE_KEY) === '1'; } catch { return false; }
}

/** UI around the engine: HUD, overlays, controls. Loaded lazily. */
export default function GameView({ onContact }: { onContact: () => void }) {
  const t = useT();
  const coarse = useCoarsePointer();
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<DesignerSurvival | null>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const [muted, setMuted] = useState(readMuted);
  const [snap, setSnap] = useState<GameSnapshot>({
    status: 'ready', score: 0, best: 0, time: 60, lives: 3, message: null, newBest: false,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let game: DesignerSurvival | null = null;
    // Wait for the UI font so canvas text renders in DM Sans.
    const fontReady = document.fonts?.load('700 11px "DM Sans"').catch(() => undefined) ?? Promise.resolve();
    let cancelled = false;
    void fontReady.then(() => {
      if (cancelled) return;
      try {
        game = new DesignerSurvival(canvas, { onChange: setSnap, muted: readMuted(), reducedMotion: reduced });
        gameRef.current = game;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Game could not start');
      }
    });
    return () => { cancelled = true; game?.destroy(); gameRef.current = null; };
  }, [reduced]);

  useEffect(() => {
    gameRef.current?.setMuted(muted);
    try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch { /* ignore */ }
  }, [muted]);

  // Move focus to the main action of each overlay for keyboard users.
  useEffect(() => {
    if (snap.status !== 'playing') primaryRef.current?.focus({ preventScroll: true });
  }, [snap.status]);

  const g = () => gameRef.current;
  const { status } = snap;
  const overlay = status !== 'playing';

  if (error) return <p className="game__error">{error}</p>;

  return (
    <div className="game">
      <dl className="game__hud">
        <div><dt className="label">{t.game.score}</dt><dd className="num">{String(snap.score).padStart(5, '0')}</dd></div>
        <div><dt className="label">{t.game.time}</dt><dd className="num">{String(snap.time).padStart(2, '0')}s</dd></div>
        <div>
          <dt className="label">{t.game.lives}</dt>
          <dd className="game__lives" aria-label={`${snap.lives} / 3`}>
            {[0, 1, 2].map((i) => <span key={i} className={i < snap.lives ? 'is-on' : ''} aria-hidden="true" />)}
          </dd>
        </div>
        <div><dt className="label">{t.game.best}</dt><dd className="num">{String(snap.best).padStart(5, '0')}</dd></div>
      </dl>

      <div className="game__stage" style={{ aspectRatio: `${W} / ${H}` }}>
        <canvas ref={canvasRef} className="game__canvas" aria-label={`${t.game.title}. ${coarse ? t.game.howToTouch : t.game.howTo}`} role="img" />

        {overlay && (
          <div className={`game__overlay game__overlay--${status}`}>
            {status === 'ready' && (
              <>
                <p className="game__kicker label">{t.game.subtitle}</p>
                <p className="game__big display">Designer<br />Survival</p>
                <ul className="game__legend label">
                  <li>Bugs</li><li>Deadlines</li><li>Bad feedback</li><li>Pixel errors</li><li>Last-minute changes</li><li>Client requests</li>
                </ul>
                <button ref={primaryRef} type="button" className="btn" onClick={() => g()?.start()}>
                  <Icon name="play" size={14} /> {t.game.start}
                </button>
                <p className="game__how label">{coarse ? t.game.howToTouch : t.game.howTo}</p>
              </>
            )}
            {status === 'paused' && (
              <>
                <p className="game__big display">{t.game.paused}</p>
                <button ref={primaryRef} type="button" className="btn" onClick={() => g()?.start()}>
                  <Icon name="play" size={14} /> {t.game.resume}
                </button>
              </>
            )}
            {status === 'won' && (
              <>
                <p className="game__big display">{t.game.winTitle}</p>
                <p className="game__score num">{snap.score} {snap.newBest && <span className="game__badge label">{t.game.best}!</span>}</p>
                <p className="game__cta display"><em>{t.game.winCta}</em></p>
                <div className="game__actions">
                  <button ref={primaryRef} type="button" className="btn" onClick={onContact}>
                    {t.game.contact} <Icon name="arrow-ne" size={14} />
                  </button>
                  <button type="button" className="btn btn--ghost" onClick={() => g()?.restart()}>
                    <Icon name="restart" size={14} /> {t.game.again}
                  </button>
                </div>
              </>
            )}
            {status === 'lost' && (
              <>
                <p className="game__big display">{t.game.loseTitle}</p>
                <p className="game__score num">{snap.score} {snap.newBest && <span className="game__badge label">{t.game.best}!</span>}</p>
                <div className="game__actions">
                  <button ref={primaryRef} type="button" className="btn" onClick={() => g()?.restart()}>
                    <Icon name="restart" size={14} /> {t.game.again}
                  </button>
                  <button type="button" className="btn btn--ghost" onClick={onContact}>
                    {t.game.contact} <Icon name="arrow-ne" size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="game__controls">
        <button type="button" className="icon-btn" onClick={() => g()?.togglePause()} disabled={status !== 'playing' && status !== 'paused'}
          aria-label={status === 'paused' ? t.game.resume : t.game.pause}>
          <Icon name={status === 'paused' ? 'play' : 'pause'} size={16} />
        </button>
        <button type="button" className="icon-btn" onClick={() => g()?.restart()} aria-label={t.game.restart}>
          <Icon name="restart" size={16} />
        </button>
        <button type="button" className="icon-btn" onClick={() => setMuted((m) => !m)} aria-pressed={muted} aria-label={muted ? t.game.unmute : t.game.mute}>
          <Icon name={muted ? 'mute' : 'sound'} size={16} />
        </button>
        <p className="game__how label">{coarse ? t.game.howToTouch : t.game.howTo}</p>
      </div>

      {/* Announce state changes and in-game messages to screen readers */}
      <p className="sr-only" aria-live="polite">
        {status === 'won' ? `${t.game.winTitle} ${t.game.winCta}` : status === 'lost' ? t.game.loseTitle : status === 'paused' ? t.game.paused : snap.message ?? ''}
      </p>
    </div>
  );
}
