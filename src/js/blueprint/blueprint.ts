/**
 * SYSTEM BLUEPRINT — the hero's static background (DAM · ASIR).
 *
 * A locked architectural drawing of a small application infrastructure:
 * client, load balancer, API servers, an SQL table mapping (DAM), firewall,
 * core switch and a server rack (ASIR), joined by orthogonal routes on one
 * 24 px grid. A fixed code-matrix block shows the same grid "quantized" into
 * interface cells (PAPER → SCREEN), without any motion.
 *
 * Fully static: nothing animates, nothing reacts to scroll or pointer.
 * The drawing is only re-rendered when the canvas size changes.
 */

export interface BlueprintOptions {
  ink?: string;
  accent?: string;
  paper?: string;
}

const CELL = 24;

type Kind = 'box' | 'rack' | 'switch' | 'table';
interface NodeSpec {
  id: string;
  label: string;
  u: number; // centre, normalised (landscape layout)
  v: number;
  w: number; // size in cells
  h: number;
  kind: Kind;
  /** Rows for a `table` node: [field, key]. */
  fields?: [string, string][];
}
interface Node extends NodeSpec { c0: number; r0: number; x: number; y: number; pw: number; ph: number }
interface EdgeSpec { a: string; b: string; dashed?: boolean }
interface Route { pts: [number, number][]; dashed: boolean }

const NODES: NodeSpec[] = [
  { id: 'app', label: 'APP · CLIENT', u: 0.52, v: 0.34, w: 4, h: 2, kind: 'box' },
  { id: 'lb', label: 'LB-01', u: 0.665, v: 0.34, w: 3, h: 2, kind: 'box' },
  { id: 'api1', label: 'API-01', u: 0.795, v: 0.27, w: 3, h: 2, kind: 'box' },
  { id: 'api2', label: 'API-02', u: 0.795, v: 0.45, w: 3, h: 2, kind: 'box' },
  {
    id: 'db', label: 'DB · SQL / projects', u: 0.925, v: 0.36, w: 4, h: 5, kind: 'table',
    fields: [['id', 'PK'], ['user_id', 'FK'], ['title', ''], ['status', ''], ['created_at', '']],
  },
  { id: 'fw', label: 'FW-EDGE', u: 0.635, v: 0.56, w: 3, h: 2, kind: 'box' },
  { id: 'sw', label: 'SW-CORE', u: 0.735, v: 0.66, w: 5, h: 1, kind: 'switch' },
  { id: 'srv', label: 'SRV-RACK-A', u: 0.915, v: 0.68, w: 2, h: 6, kind: 'rack' },
];
const EDGES: EdgeSpec[] = [
  { a: 'app', b: 'lb' },
  { a: 'lb', b: 'api1' },
  { a: 'lb', b: 'api2' },
  { a: 'api1', b: 'db' },
  { a: 'api2', b: 'db' },
  { a: 'fw', b: 'lb', dashed: true },
  { a: 'fw', b: 'sw' },
  { a: 'sw', b: 'srv' },
  { a: 'srv', b: 'db', dashed: true },
];

/** Fixed code-matrix block, in layout space (stepped edges, no motion). */
const MATRIX = { u0: 0.7, u1: 0.86, v0: 0.5, v1: 0.6 };

const EMPTY = 0;
const ROUTE = 1;
const INSIDE = 2;
const BORDER = 3;

export class SystemBlueprint {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly opts: Required<BlueprintOptions>;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private cols = 0;
  private rows = 0;
  private nodes: Node[] = [];
  private routes: Route[] = [];
  private occ = new Uint8Array(0);
  private ro: ResizeObserver;

  constructor(canvas: HTMLCanvasElement, options: BlueprintOptions = {}) {
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('Canvas 2D not supported');
    this.canvas = canvas;
    this.ctx = ctx;
    this.opts = { ink: '#000000', accent: '#05D991', paper: '#E8E8E8', ...options };
    this.render();
    // Only a size change re-renders (resizing a canvas clears it).
    this.ro = new ResizeObserver(() => this.render());
    this.ro.observe(canvas);
  }

  destroy(): void { this.ro.disconnect(); }

  // ── layout ──────────────────────────────────────────────────────

  private render(): void {
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (w === this.w && h === this.h && dpr === this.dpr) return;
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.cols = Math.ceil(w / CELL);
    this.rows = Math.ceil(h / CELL);
    this.occ = new Uint8Array(this.cols * this.rows);
    this.layout();
    this.draw();
  }

  private portrait(): boolean { return this.h > this.w * 1.1; }

  private place(u: number, v: number): [number, number] {
    if (this.portrait()) return [this.w * (0.04 + ((u - 0.45) / 0.53) * 0.92), this.h * (0.2 + (v - 0.25) * 0.62)];
    return [this.w * u, this.h * v];
  }

  private layout(): void {
    const C = CELL;
    const scale = this.w < 600 ? 0.75 : 1;
    this.nodes = NODES.map((s) => {
      const w = Math.max(s.kind === 'table' ? 3 : 1, Math.round(s.w * scale));
      const h = Math.max(1, Math.round(s.h * scale));
      const [cx, cy] = this.place(s.u, s.v);
      const c0 = Math.min(this.cols - w - 1, Math.max(1, Math.round(cx / C - w / 2)));
      const r0 = Math.min(this.rows - h - 1, Math.max(1, Math.round(cy / C - h / 2)));
      return { ...s, w, h, c0, r0, x: c0 * C, y: r0 * C, pw: w * C, ph: h * C };
    });
    const byId = new Map(this.nodes.map((n) => [n.id, n]));
    this.routes = EDGES.map((e) => this.route(byId.get(e.a)!, byId.get(e.b)!, Boolean(e.dashed)));
    for (const r of this.routes) this.raster(r);
    for (const n of this.nodes) {
      for (let r = n.r0; r < n.r0 + n.h; r++) {
        for (let c = n.c0; c < n.c0 + n.w; c++) {
          const edge = r === n.r0 || r === n.r0 + n.h - 1 || c === n.c0 || c === n.c0 + n.w - 1;
          this.occ[r * this.cols + c] = edge ? BORDER : INSIDE;
        }
      }
    }
  }

  /** Orthogonal route through cell centres. */
  private route(a: Node, b: Node, dashed: boolean): Route {
    const C = CELL;
    const half = C / 2;
    const acx = (a.c0 + Math.floor(a.w / 2)) * C + half;
    const acy = (a.r0 + Math.floor(a.h / 2)) * C + half;
    const bcx = (b.c0 + Math.floor(b.w / 2)) * C + half;
    const bcy = (b.r0 + Math.floor(b.h / 2)) * C + half;
    const snap = (v: number) => Math.floor(v / C) * C + half;
    let pts: [number, number][];
    if (Math.abs(bcx - acx) >= Math.abs(bcy - acy)) {
      const dir = bcx > acx ? 1 : -1;
      const sx = dir > 0 ? a.x + a.pw : a.x;
      const ex = dir > 0 ? b.x : b.x + b.pw;
      const mx = snap((sx + ex) / 2);
      pts = [[sx, acy], [mx, acy], [mx, bcy], [ex, bcy]];
    } else {
      const dir = bcy > acy ? 1 : -1;
      const sy = dir > 0 ? a.y + a.ph : a.y;
      const ey = dir > 0 ? b.y : b.y + b.ph;
      const my = snap((sy + ey) / 2);
      pts = [[acx, sy], [acx, my], [bcx, my], [bcx, ey]];
    }
    pts = pts.filter((p, i) => i === 0 || p[0] !== pts[i - 1]![0] || p[1] !== pts[i - 1]![1]);
    return { pts, dashed };
  }

  private raster(r: Route): void {
    for (let i = 1; i < r.pts.length; i++) {
      const [x0, y0] = r.pts[i - 1]!;
      const [x1, y1] = r.pts[i]!;
      const steps = Math.max(1, Math.round((Math.abs(x1 - x0) + Math.abs(y1 - y0)) / (CELL / 2)));
      for (let s = 0; s <= steps; s++) {
        const c = Math.floor((x0 + ((x1 - x0) * s) / steps) / CELL);
        const rr = Math.floor((y0 + ((y1 - y0) * s) / steps) / CELL);
        if (c < 0 || rr < 0 || c >= this.cols || rr >= this.rows) continue;
        const k = rr * this.cols + c;
        if (this.occ[k] === EMPTY) this.occ[k] = ROUTE;
      }
    }
  }

  // ── drawing (once per size) ─────────────────────────────────────

  private draw(): void {
    const g = this.ctx;
    const { ink, accent, paper } = this.opts;
    // Portrait heroes have no free area: the drawing recedes behind the type.
    const quiet = this.portrait() ? 0.4 : 1;
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    g.clearRect(0, 0, this.w, this.h);
    g.lineCap = 'butt';
    g.lineJoin = 'miter';
    g.font = '500 9px "DM Sans", system-ui, sans-serif';
    (g as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '0.8px';

    // Routes
    g.strokeStyle = ink;
    g.lineWidth = 1;
    for (const r of this.routes) {
      g.globalAlpha = (r.dashed ? 0.45 : 0.6) * quiet;
      g.setLineDash(r.dashed ? [4, 4] : []);
      g.beginPath();
      r.pts.forEach(([x, y], i) => (i ? g.lineTo(x + 0.5, y + 0.5) : g.moveTo(x + 0.5, y + 0.5)));
      g.stroke();
    }
    g.setLineDash([]);

    // Nodes
    for (const n of this.nodes) {
      g.globalAlpha = quiet;
      g.fillStyle = paper;
      g.fillRect(n.x, n.y, n.pw, n.ph);
      g.strokeStyle = ink;
      g.lineWidth = 1.25;
      g.strokeRect(n.x + 0.5, n.y + 0.5, n.pw - 1, n.ph - 1);
      g.lineWidth = 1;
      if (n.kind === 'table' && n.fields) this.drawTable(n, quiet);
      else this.drawHardware(n, quiet);
      g.globalAlpha = 0.75 * quiet;
      g.fillStyle = ink;
      g.textAlign = 'start';
      g.fillText(n.label, n.x, n.y - 6);
    }

    // Ports where routes meet nodes
    g.globalAlpha = quiet;
    g.fillStyle = ink;
    for (const r of this.routes) {
      const [sx, sy] = r.pts[0]!;
      const [ex, ey] = r.pts[r.pts.length - 1]!;
      g.fillRect(sx - 2, sy - 2, 4, 4);
      g.fillRect(ex - 2, ey - 2, 4, 4);
    }
    // Data-flow markers: one fixed marker at each solid route's midpoint
    g.fillStyle = accent;
    g.strokeStyle = ink;
    for (const r of this.routes) {
      if (r.dashed || r.pts.length < 2) continue;
      const [x, y] = r.pts[Math.floor(r.pts.length / 2)]!;
      g.fillRect(Math.round(x) - 3, Math.round(y) - 3, 6, 6);
      g.strokeRect(Math.round(x) - 3.5, Math.round(y) - 3.5, 7, 7);
    }

    this.drawMatrix(quiet);
    this.drawFrame(quiet);
    g.globalAlpha = 1;
  }

  private drawHardware(n: Node, quiet: number): void {
    const g = this.ctx;
    const { ink, accent } = this.opts;
    g.globalAlpha = 0.35 * quiet;
    g.strokeStyle = ink;
    g.beginPath();
    if (n.kind === 'rack') {
      for (let y = n.y + 6; y < n.y + n.ph - 2; y += 6) { g.moveTo(n.x + 4, y + 0.5); g.lineTo(n.x + n.pw - 10, y + 0.5); }
    } else if (n.kind === 'switch') {
      for (let x = n.x + 6; x < n.x + n.pw - 8; x += 8) g.rect(x + 0.5, n.y + n.ph / 2 - 2.5, 4, 4);
    } else {
      g.moveTo(n.x + 1, n.y + 8.5); g.lineTo(n.x + n.pw - 1, n.y + 8.5);
    }
    g.stroke();
    // Status indicators — fixed states (one accent "online" mark per device)
    g.globalAlpha = quiet;
    if (n.kind === 'rack') {
      const slots = Math.max(1, Math.floor((n.ph - 8) / 12));
      for (let s = 0; s < slots; s++) {
        const on = s % 4 === 1;
        g.fillStyle = on ? accent : ink;
        g.globalAlpha = (on ? 1 : 0.3) * quiet;
        g.fillRect(n.x + n.pw - 7, n.y + 5 + s * 12, 3, 3);
      }
    } else {
      g.fillStyle = accent;
      g.fillRect(n.x + n.pw - 7, n.y + 3, 3, 3);
    }
  }

  /** Database mapping: header + typed fields with key markers. */
  private drawTable(n: Node, quiet: number): void {
    const g = this.ctx;
    const { ink, accent } = this.opts;
    const rowH = Math.max(12, Math.floor((n.ph - 14) / n.fields!.length));
    g.globalAlpha = quiet;
    g.fillStyle = ink;
    g.fillRect(n.x, n.y, n.pw, 12);
    g.fillStyle = this.opts.paper;
    g.fillText('TABLE', n.x + 5, n.y + 9);
    n.fields!.forEach(([field, key], i) => {
      const y = n.y + 14 + i * rowH;
      g.globalAlpha = 0.25 * quiet;
      g.strokeStyle = ink;
      g.beginPath();
      g.moveTo(n.x + 1, y + rowH - 0.5);
      g.lineTo(n.x + n.pw - 1, y + rowH - 0.5);
      g.stroke();
      g.globalAlpha = 0.85 * quiet;
      g.fillStyle = ink;
      g.textAlign = 'start';
      g.fillText(field, n.x + 5, y + rowH - 4);
      if (key) {
        g.fillStyle = key === 'PK' ? accent : ink;
        g.globalAlpha = quiet;
        g.textAlign = 'end';
        g.fillText(key, n.x + n.pw - 5, y + rowH - 4);
      }
    });
    g.textAlign = 'start';
  }

  /** Fixed code matrix: the grid rendered as interface cells (stepped edge). */
  private drawMatrix(quiet: number): void {
    if (this.portrait()) return; // no free area on portrait screens
    const g = this.ctx;
    const { ink, accent, paper } = this.opts;
    const C = CELL;
    const [x0, y0] = this.place(MATRIX.u0, MATRIX.v0);
    const [x1, y1] = this.place(MATRIX.u1, MATRIX.v1);
    const c0 = Math.floor(x0 / C);
    const c1 = Math.floor(x1 / C);
    const r0 = Math.floor(y0 / C);
    const r1 = Math.floor(y1 / C);
    const hash = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
    const cells: [number, number, number][] = [];
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const i = r * this.cols + c;
        // Stepped, deterministic edge: corners are trimmed like a pixel staircase.
        const edgeDist = Math.min(c - c0, c1 - c, r - r0, r1 - r);
        if (edgeDist === 0 && hash(i) < 0.45) continue;
        cells.push([c, r, i]);
      }
    }
    g.globalAlpha = quiet;
    g.fillStyle = paper;
    for (const [c, r] of cells) g.fillRect(c * C, r * C, C, C);
    g.globalAlpha = 0.14 * quiet;
    g.strokeStyle = ink;
    g.lineWidth = 1;
    g.beginPath();
    for (const [c, r] of cells) g.rect(c * C + 0.5, r * C + 0.5, C - 1, C - 1);
    g.stroke();

    g.globalAlpha = quiet;
    g.textAlign = 'center';
    for (const [c, r, i] of cells) {
      const x = c * C;
      const y = r * C;
      switch (this.occ[i]) {
        case BORDER: g.fillStyle = accent; g.fillRect(x + 1, y + 1, C - 2, C - 2); break;
        case INSIDE: g.strokeStyle = ink; g.lineWidth = 1.25; g.strokeRect(x + 5.5, y + 5.5, C - 11, C - 11); break;
        case ROUTE: g.fillStyle = ink; g.fillRect(x + C / 2 - 2, y + C / 2 - 2, 4, 4); break;
        default: {
          const h = hash(i);
          if (h < 0.42) {
            g.fillStyle = ink;
            g.globalAlpha = 0.3 * quiet;
            g.fillText(h < 0.21 ? '0' : '1', x + C / 2, y + C / 2 + 3);
            g.globalAlpha = quiet;
          }
        }
      }
    }
    g.textAlign = 'start';
  }

  /** Registration marks + drawing title around the topology. */
  private drawFrame(quiet: number): void {
    const g = this.ctx;
    const minX = Math.min(...this.nodes.map((n) => n.x)) - CELL;
    const minY = Math.min(...this.nodes.map((n) => n.y)) - CELL * 2;
    const maxX = Math.max(...this.nodes.map((n) => n.x + n.pw)) + CELL;
    const maxY = Math.max(...this.nodes.map((n) => n.y + n.ph)) + CELL;
    const m = 10;
    g.strokeStyle = this.opts.ink;
    g.globalAlpha = 0.4 * quiet;
    g.lineWidth = 1;
    g.beginPath();
    for (const [x, y, dx, dy] of [[minX, minY, 1, 1], [maxX, minY, -1, 1], [minX, maxY, 1, -1], [maxX, maxY, -1, -1]] as const) {
      g.moveTo(x + 0.5, y + dy * m + 0.5); g.lineTo(x + 0.5, y + 0.5); g.lineTo(x + dx * m + 0.5, y + 0.5);
    }
    g.stroke();
    g.globalAlpha = 0.55 * quiet;
    g.fillStyle = this.opts.ink;
    g.fillText('NET / TOPOLOGY-01', minX + 14, minY + 4);
  }
}
