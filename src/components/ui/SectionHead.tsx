import type { ReactNode } from 'react';

interface Props {
  index: string;
  eyebrow: string;
  id?: string;
  /** Optional lead paragraph, aligned to the title on the editorial axis. */
  intro?: ReactNode;
  /** Optional extra row (e.g. a chain of tags) under the intro. */
  extra?: ReactNode;
  children: ReactNode;
}

/**
 * The single section-heading pattern used across the site:
 * index · eyebrow in columns 1–3, title (and intro) from column 4.
 */
export function SectionHead({ index, eyebrow, id, intro, extra, children }: Props) {
  return (
    <header className="sec-head">
      <p className="sec-head__meta label" aria-hidden="true">
        <span className="num">{index}</span>
        <span className="label--muted">{eyebrow}</span>
      </p>
      <h2 className="sec-head__title display reveal" id={id}>{children}</h2>
      {intro && <p className="sec-head__intro reveal">{intro}</p>}
      {extra && <div className="sec-head__extra">{extra}</div>}
    </header>
  );
}
