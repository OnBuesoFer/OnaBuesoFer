/**
 * Clearly identified placeholder for a missing asset: a stepped pixel
 * composition in the brand language + an "ASSET PENDING" label.
 */
export function PixelPlaceholder({ label, seed = 1, className = '' }: { label: string; seed?: number; className?: string }) {
  const cells: { x: number; y: number; k: number }[] = [];
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 16; x++) {
      const n = Math.sin((x + 1) * 12.9898 * seed + (y + 1) * 78.233) * 43758.5453;
      const r = n - Math.floor(n);
      const stair = x + y * 1.4 > 13 + seed * 2;
      if (stair && r > 0.25) cells.push({ x, y, k: r > 0.9 ? 2 : 1 });
    }
  }
  return (
    <div className={`px-placeholder ${className}`} role="img" aria-label={label}>
      <svg viewBox="0 0 16 10" preserveAspectRatio="none" aria-hidden="true">
        {cells.map((c) => (
          <rect key={`${c.x}-${c.y}`} x={c.x + 0.04} y={c.y + 0.04} width={0.92} height={0.92}
            className={c.k === 2 ? 'px-placeholder__accent' : 'px-placeholder__cell'} />
        ))}
      </svg>
      <span className="pending">{label}</span>
    </div>
  );
}
