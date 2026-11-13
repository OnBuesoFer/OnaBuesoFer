/**
 * QUANTIZE — the ART → TECHNOLOGY field.
 *
 * An organic "ink" field (animated metaballs drawn as topographic
 * contour lines) is progressively quantized into a structured pixel grid:
 *   • locally, inside a lens that follows the pointer / touch;
 *   • globally, as the visitor scrolls (a stepped sweep from the bottom).
 *
 * Framework-agnostic: React only mounts it. Canvas 2D is enough here —
 * the field is sampled on a coarse grid (~9k samples), so it stays well
 * inside a 60 fps budget without WebGL.
 */

export interface QuantizeOptions {
  reducedMotion: boolean;
  /** Ink colour for contours / outlines. */
  ink?: string;
  /** Accent used for the quantized edge band. */
  accent?: string;
}

interface Blob {
  ax: number; bx: number; wx: number; px: number;
  ay: number; by: number; wy: number; py: number;
  r: number;
}

const LEVELS = [1, 1.45, 2.1, 3.1];
const SAMPLE = 12; // px between field samples (contour resolution)
const CELL = 24; // px quantized pixel size (2 × SAMPLE)

// Marching squares: for each of 16 cases, pairs of edges to connect.
// Edges: 0 = top, 1 = right, 2 = bottom, 3 = left.
const SEGMENTS: number[][] = [
  [], [3, 2], [2, 1], [3, 1], [0, 1], [3, 0, 2, 1], [0, 2], [3, 0],
  [3, 0], [0, 2], [0, 3, 1, 2], [0, 1], [3, 1], [2, 1], [3, 2], [],
];

export class QuantizeField {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly opts: Required<QuantizeOptions>;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private cols = 0;
  private rows = 0;
  private field = new Float32Array(0);
  private hash = new Float32Array(0);
  private blobs: Blob[] = [];
  private t = 0;
  private raf = 0;
  private last = 0;
  private running = false;
  private visible = true;
  private progress = 0;
  private pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false, r: 0 };
  private io: IntersectionObserver | null = null;
  private ro: ResizeObserver | null = null;

  constructor(canvas: HTMLCanvasElement, options: QuantizeOptions) {
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('Canvas 2D not supported');
    this.canvas = canvas;
    this.ctx = ctx;
    this.opts = { ink: '#000000', accent: '#05D991', ...options };
    this.blobs = this.makeBlobs();
    this.resize();

    this.ro = new ResizeObserver(() => { this.resize(); if (!this.running) this.draw(); });
    this.ro.observe(canvas);
    this.io = new IntersectionObserver(([e]) => {
      this.visible = Boolean(e?.isIntersecting);
      if (this.visible) this.start(); else this.stop();
    });
    this.io.observe(canvas);
    document.addEventListener('visibilitychange', this.onVisibility);

    if (this.opts.reducedMotion) {
      // One composed still frame, mid-transformation.
      this.t = 14;
      this.progress = 0.3;
      this.pointer = { x: this.w * 0.68, y: this.h * 0.42, tx: 0, ty: 0, active: true, r: Math.min(this.w, this.h) * 0.28 };
      this.draw();
    }
  }

  /** Pointer position in canvas CSS pixels. */
  setPointer(x: number, y: number): void {
    this.pointer.tx = x;
    this.pointer.ty = y;
    if (!this.pointer.active) { this.pointer.x = x; this.pointer.y = y; }
    this.pointer.active = true;
  }

  releasePointer(): void { this.pointer.active = false; }

  /** 0 → organic, 1 → fully quantized. */
  setProgress(p: number): void {
    this.progress = Math.min(1, Math.max(0, p));
    if (this.opts.reducedMotion) return;
    if (!this.running) this.draw();
  }

  start(): void {
    if (this.running || this.opts.reducedMotion || !this.visible || document.hidden) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  destroy(): void {
    this.stop();
    this.io?.disconnect();
    this.ro?.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
  }

  // ── internals ────────────────────────────────────────────────────

  private onVisibility = () => { if (document.hidden) this.stop(); else this.start(); };

  private makeBlobs(): Blob[] {
    // Composition: mass weighted to the right/top so the headline (bottom-left) breathes.
    const spec: [number, number, number, number, number][] = [
      // ax,   ay,   amplitude, radius, speed
      [0.78, 0.34, 0.14, 0.17, 0.11],
      [1.12, 0.52, 0.18, 0.13, 0.08],
      [0.98, 0.22, 0.12, 0.10, 0.14],
      [1.32, 0.30, 0.16, 0.15, 0.09],
      [0.55, 0.18, 0.10, 0.08, 0.13],
      [1.20, 0.78, 0.14, 0.09, 0.12],
      [0.36, 0.42, 0.08, 0.055, 0.17],
    ];
    return spec.map(([ax, ay, amp, r, s], i) => ({
      ax, bx: amp, wx: s * (1 + i * 0.07), px: i * 1.7,
      ay, by: amp * 0.8, wy: s * 0.83, py: i * 2.3,
      r,
    }));
  }

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.w = Math.max(1, rect.width);
    this.h = Math.max(1, rect.height);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.cols = Math.ceil(this.w / SAMPLE) + 1;
    this.rows = Math.ceil(this.h / SAMPLE) + 1;
    this.field = new Float32Array(this.cols * this.rows);
    const qc = Math.ceil(this.w / CELL) + 1;
    const qr = Math.ceil(this.h / CELL) + 1;
    this.hash = new Float32Array(qc * qr);
    for (let i = 0; i < this.hash.length; i++) {
      const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
      this.hash[i] = s - Math.floor(s);
    }
    // Responsive composition: on portrait screens shift mass downwards.
    const portrait = this.h > this.w;
    this.blobs.forEach((b, i) => {
      b.r = [0.17, 0.13, 0.1, 0.15, 0.08, 0.09, 0.055][i]! * (portrait ? 0.8 : 1);
    });
  }

  private loop = (now: number) => {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.t += dt;
    this.step(dt);
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  };

  private step(dt: number): void {
    const p = this.pointer;
    const base = Math.min(this.w, this.h);
    if (p.active) {
      const k = 1 - Math.pow(0.0008, dt); // frame-rate independent easing
      p.x += (p.tx - p.x) * k;
      p.y += (p.ty - p.y) * k;
      p.r += (base * 0.26 - p.r) * k * 0.6;
    } else {
      // Autonomous drift so touch screens and idle visitors still see the idea.
      const ax = this.w * (0.66 + 0.2 * Math.sin(this.t * 0.23));
      const ay = this.h * (0.42 + 0.22 * Math.sin(this.t * 0.31 + 1.2));
      p.x += (ax - p.x) * dt * 0.8;
      p.y += (ay - p.y) * dt * 0.8;
      p.r += (base * 0.17 - p.r) * dt * 1.2;
    }
  }

  /** Scalar field value at canvas pixel (x, y). */
  private sample(x: number, y: number): number {
    const H = this.h;
    const u = x / H;
    const v = y / H;
    const t = this.t;
    // Gentle domain warp → brush-like irregularity
    const wu = u + 0.018 * Math.sin(v * 9 + t * 0.6);
    const wv = v + 0.018 * Math.cos(u * 8 - t * 0.5);
    const shift = this.w / H - 1.5; // keep composition anchored right on wide screens
    let f = 0;
    for (const b of this.blobs) {
      const cx = b.ax + shift * 0.6 + b.bx * Math.sin(t * b.wx + b.px);
      const cy = b.ay + b.by * Math.cos(t * b.wy + b.py);
      const dx = wu - cx;
      const dy = wv - cy;
      f += (b.r * b.r) / (dx * dx + dy * dy + 1e-4);
    }
    return f;
  }

  private isQuantized(cx: number, cy: number, qi: number): boolean {
    const p = this.pointer;
    const dx = cx - p.x;
    const dy = cy - p.y;
    if (dx * dx + dy * dy < p.r * p.r) return true;
    if (this.progress <= 0) return false;
    // Stepped sweep from the bottom edge as the hero scrolls away
    const rowT = 1 - cy / this.h;
    const thr = rowT * 0.72 + (this.hash[qi] ?? 0) * 0.28;
    return thr < this.progress * 1.35;
  }

  private draw(): void {
    const { ctx, dpr, cols, rows, field } = this;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) field[j * cols + i] = this.sample(i * SAMPLE, j * SAMPLE);
    }

    const qCols = Math.ceil(this.w / CELL) + 1;
    const qRows = Math.ceil(this.h / CELL) + 1;
    const mask = new Uint8Array(qCols * qRows);
    for (let qj = 0; qj < qRows; qj++) {
      for (let qi = 0; qi < qCols; qi++) {
        const idx = qj * qCols + qi;
        mask[idx] = this.isQuantized(qi * CELL + CELL / 2, qj * CELL + CELL / 2, idx) ? 1 : 0;
      }
    }

    this.drawContours(mask, qCols);
    this.drawCells(mask, qCols, qRows);
    this.drawCrosshair();
  }

  private drawContours(mask: Uint8Array, qCols: number): void {
    const { ctx, cols, rows, field } = this;
    const S = SAMPLE;
    ctx.strokeStyle = this.opts.ink;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    LEVELS.forEach((level, li) => {
      ctx.beginPath();
      ctx.lineWidth = li === 0 ? 1.4 : 0.9;
      ctx.globalAlpha = li === 0 ? 0.85 : 0.5;
      for (let j = 0; j < rows - 1; j++) {
        for (let i = 0; i < cols - 1; i++) {
          const x = i * S;
          const y = j * S;
          if (mask[Math.floor(y / CELL) * qCols + Math.floor(x / CELL)]) continue;
          const a = field[j * cols + i]!;
          const b = field[j * cols + i + 1]!;
          const c = field[(j + 1) * cols + i + 1]!;
          const d = field[(j + 1) * cols + i]!;
          const code = (a >= level ? 8 : 0) | (b >= level ? 4 : 0) | (c >= level ? 2 : 0) | (d >= level ? 1 : 0);
          const seg = SEGMENTS[code]!;
          for (let k = 0; k < seg.length; k += 2) {
            const p1 = this.edgePoint(seg[k]!, x, y, a, b, c, d, level);
            const p2 = this.edgePoint(seg[k + 1]!, x, y, a, b, c, d, level);
            ctx.moveTo(p1[0], p1[1]);
            ctx.lineTo(p2[0], p2[1]);
          }
        }
      }
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }

  private edgePoint(edge: number, x: number, y: number, a: number, b: number, c: number, d: number, l: number): [number, number] {
    const S = SAMPLE;
    const lerp = (v1: number, v2: number) => (v2 === v1 ? 0.5 : (l - v1) / (v2 - v1));
    switch (edge) {
      case 0: return [x + S * lerp(a, b), y];
      case 1: return [x + S, y + S * lerp(b, c)];
      case 2: return [x + S * lerp(d, c), y + S];
      default: return [x, y + S * lerp(a, d)];
    }
  }

  private drawCells(mask: Uint8Array, qCols: number, qRows: number): void {
    const { ctx } = this;
    const C = CELL;
    const L0 = LEVELS[0]!;
    // Pass 1 — grid hairlines for every quantized cell
    ctx.beginPath();
    for (let qj = 0; qj < qRows; qj++) {
      for (let qi = 0; qi < qCols; qi++) {
        if (!mask[qj * qCols + qi]) continue;
        ctx.rect(qi * C + 0.5, qj * C + 0.5, C - 1, C - 1);
      }
    }
    ctx.strokeStyle = this.opts.ink;
    ctx.globalAlpha = 0.12;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Pass 2 — accent edge band (green fills) + nested outlines inside the ink
    const edge = new Path2D();
    const inner = new Path2D();
    const core = new Path2D();
    for (let qj = 0; qj < qRows; qj++) {
      for (let qi = 0; qi < qCols; qi++) {
        if (!mask[qj * qCols + qi]) continue;
        const x = qi * C;
        const y = qj * C;
        const v = this.sample(x + C / 2, y + C / 2);
        if (v < L0) continue;
        if (v < L0 * 1.3) {
          edge.rect(x + 1, y + 1, C - 2, C - 2);
        } else {
          const depth = Math.min(1, (v - L0) / 2.4);
          const inset = 3 + (1 - depth) * 5;
          inner.rect(x + inset + 0.5, y + inset + 0.5, C - inset * 2 - 1, C - inset * 2 - 1);
          if (v > LEVELS[2]!) core.rect(x + C / 2 - 2, y + C / 2 - 2, 4, 4);
        }
      }
    }
    ctx.fillStyle = this.opts.accent;
    ctx.fill(edge);
    ctx.strokeStyle = this.opts.ink;
    ctx.lineWidth = 1.25;
    ctx.stroke(inner);
    ctx.fillStyle = this.opts.ink;
    ctx.fill(core);
  }

  private drawCrosshair(): void {
    const { ctx } = this;
    const p = this.pointer;
    if (!p.active && !this.opts.reducedMotion) return;
    const x = Math.round(p.x) + 0.5;
    const y = Math.round(p.y) + 0.5;
    ctx.strokeStyle = this.opts.ink;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 10, y); ctx.lineTo(x + 10, y);
    ctx.moveTo(x, y - 10); ctx.lineTo(x, y + 10);
    ctx.stroke();
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = this.opts.ink;
    ctx.font = '500 10px "DM Sans", system-ui, sans-serif';
    const pad = (n: number) => String(Math.max(0, Math.round(n))).padStart(4, '0');
    ctx.fillText(`X ${pad(p.x)}  Y ${pad(p.y)}`, x + 14, y - 8);
    ctx.fillText(`Q ${(this.progress * 100).toFixed(0).padStart(3, '0')}%  ${CELL}PX`, x + 14, y + 16);
    ctx.globalAlpha = 1;
  }
}
