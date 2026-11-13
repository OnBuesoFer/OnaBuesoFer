import type { ReactNode } from 'react';

interface Props {
  index: string;
  eyebrow: string;
  id?: string;
  children: ReactNode;
}

/** Editorial section heading: index · eyebrow on the left, title on the grid. */
export function SectionHead({ index, eyebrow, id, children }: Props) {
  return (
    <header className="sec-head reveal">
      <p className="sec-head__meta label" aria-hidden="true">
        <span className="num">{index}</span>
        <span className="label--muted">{eyebrow}</span>
      </p>
      <h2 className="sec-head__title display" id={id}>{children}</h2>
    </header>
  );
}
