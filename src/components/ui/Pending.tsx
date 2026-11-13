import { useT } from '../../lib/i18n.tsx';

/** Visible marker for information that has not been supplied yet. */
export function Pending({ children }: { children?: string }) {
  const t = useT();
  return (
    <span className="pending" title={t.a11y.pending}>
      {children ?? 'Pending'}
    </span>
  );
}
