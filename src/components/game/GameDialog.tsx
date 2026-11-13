import { lazy, Suspense, useEffect, useRef } from 'react';
import { useGame } from '../../lib/game.tsx';
import { useLang, useT } from '../../lib/i18n.tsx';
import { href, routePath, useRouter } from '../../lib/router.tsx';
import { Icon } from '../ui/Icon.tsx';

// The game (engine + UI) is its own chunk: zero cost until PLAY? is pressed.
const GameView = lazy(() => import('./GameView.tsx'));

/**
 * Native <dialog>: focus trap, Escape to close and focus return come for
 * free. The page underneath keeps its scroll position.
 */
export function GameDialog() {
  const { isOpen, close } = useGame();
  const t = useT();
  const lang = useLang();
  const { navigate } = useRouter();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (isOpen && !d.open) {
      d.showModal();
      document.body.classList.add('is-locked');
    } else if (!isOpen && d.open) {
      d.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onClose = () => { document.body.classList.remove('is-locked'); close(); };
    d.addEventListener('close', onClose);
    return () => d.removeEventListener('close', onClose);
  }, [close]);

  const goContact = () => {
    ref.current?.close();
    navigate(href(routePath({ name: 'home', lang }), 'contact'));
  };

  return (
    <dialog ref={ref} className="game-dialog" data-tone="dark" aria-labelledby="game-title">
      <div className="game-dialog__head">
        <h2 id="game-title" className="game-dialog__title">
          <span className="px" aria-hidden="true" /> {t.game.title}
        </h2>
        <button type="button" className="icon-btn" onClick={() => ref.current?.close()} aria-label={t.game.close}>
          <Icon name="close" size={20} />
        </button>
      </div>
      {isOpen && (
        <Suspense fallback={<p className="game-dialog__loading label">{t.game.loading}</p>}>
          <GameView onContact={goContact} />
        </Suspense>
      )}
    </dialog>
  );
}
