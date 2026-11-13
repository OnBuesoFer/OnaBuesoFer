/**
 * ART / TECH convergence. Left: organic, hand-drawn forms. Right: grid,
 * nodes and modules. Both resolve into "ONA." in the centre.
 * `focus` highlights one side (driven by hovering the lists).
 */
export function ArtTechDiagram({ focus, label }: { focus: 'art' | 'tech' | null; label: string }) {
  const techCells: [number, number][] = [];
  for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) if ((x + y * 2) % 3 !== 0 || x > 3) techCells.push([x, y]);

  return (
    <svg className="diagram reveal" data-focus={focus ?? 'none'} viewBox="0 0 640 360" role="img" aria-label={label}>
      {/* ART — organic */}
      <g className="diagram__art">
        <path className="draw" d="M40 120 C 70 40, 170 50, 180 120 S 120 230, 80 200 S 20 170, 40 120 Z" />
        <path className="draw" d="M60 260 C 110 220, 150 300, 210 250 S 250 300, 230 320" />
        <circle className="draw" cx="150" cy="190" r="34" />
        <path className="draw" d="M30 310 Q 60 280 90 312 T 150 312" />
        <circle className="ink" cx="110" cy="108" r="5" />
        <circle className="ink" cx="226" cy="318" r="3" />
      </g>
      {/* TECH — structured */}
      <g className="diagram__tech">
        {techCells.map(([x, y]) => (
          <rect key={`${x}-${y}`} className="cell" x={430 + x * 30} y={70 + y * 30} width={24} height={24} />
        ))}
        <rect className="accent" x={490} y={130} width={24} height={24} />
        <rect className="accent" x={550} y={220} width={24} height={24} />
        <path className="draw" d="M420 300 H 610 M420 300 V 290 M610 300 V 290" />
      </g>
      {/* CONNECTION — lines converging */}
      <g className="diagram__links">
        <path className="draw link-art" d="M180 120 C 240 120, 260 180, 300 180" />
        <path className="draw link-art" d="M184 190 C 230 190, 260 180, 300 180" />
        <path className="draw link-art" d="M230 300 C 270 280, 270 190, 300 180" />
        <path className="draw link-tech" d="M430 82 C 380 82, 380 180, 340 180" />
        <path className="draw link-tech" d="M430 172 H 340" />
        <path className="draw link-tech" d="M430 232 C 390 232, 380 180, 340 180" />
      </g>
      <g className="diagram__core">
        <rect x="292" y="160" width="56" height="40" />
        <text x="320" y="187" textAnchor="middle">ONA.</text>
      </g>
      <text className="diagram__label" x="40" y="30">ART</text>
      <text className="diagram__label" x="610" y="30" textAnchor="end">TECH</text>
    </svg>
  );
}
