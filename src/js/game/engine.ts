/**
 * DESIGNER SURVIVAL — a minimalist arcade about surviving the creative industry.
 *
 * Framework-agnostic engine (Canvas 2D + Web Audio, no assets to download).
 * The React layer renders HUD/overlays from the snapshots this emits.
 *
 * Survive a 60-second "iteration": dodge or delete BUGS, DEADLINES,
 * BAD FEEDBACK, PIXEL ERRORS, LAST-MINUTE CHANGES and CLIENT REQUESTS.
 */

export type GameStatus = 'ready' | 'playing' | 'paused' | 'won' | 'lost';

export interface GameSnapshot {
  status: GameStatus;
  score: number;
  best: number;
  time: number; // seconds remaining (ceil)
  lives: number;
  message: string | null;
  newBest: boolean;
}

export interface GameOptions {
  onChange: (s: GameSnapshot) => void;
  muted: boolean;
  reducedMotion: boolean;
}

type Kind = 'bug' | 'deadline' | 'feedback' | 'pixel' | 'change' | 'request' | 'coffee';

interface Enemy {
  kind: Kind;
  x: number; y: number; w: number; h: number;
  vx: number; vy: number;
  hp: number; t: number; seed: number;
  mini?: boolean; dashed?: boolean; flash: number;
}
interface Bullet { x: number; y: number }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; c: string }

export const W = 360;
export const H = 540;
const DURATION = 60;
const MAX_LIVES = 3;
const BEST_KEY = 'ona-designer-survival-best';

const C = {
  bg: '#00231F',
  grid: 'rgba(5, 217, 145, 0.07)',
  ink: '#E8E8E8',
  dim: 'rgba(232, 232, 232, 0.55)',
  green: '#05D991',
  black: '#000000',
};

/** Messages shown when an obstacle hits the player. */
const MESSAGES: Record<Exclude<Kind, 'coffee'>, string> = {
  bug: "IT'S NOT A FEATURE. IT'S A BUG.",
  deadline: 'THE DEADLINE WAS YESTERDAY.',
  request: 'CAN YOU MAKE IT POP?',
  change: 'JUST ONE MORE CHANGE.',
  pixel: 'PIXEL PERFECT OR NOTHING.',
  feedback: 'BACK TO THE DRAWING BOARD.',
};

const POINTS: Record<Kind, number> = { bug: 10, deadline: 15, feedback: 20, pixel: 10, change: 25, request: 40, coffee: 0 };

// 1-bit pixel sprites ('#' = ink, '+' = accent)
const SPRITES: Record<'pen' | 'bug' | 'clock' | 'coffee', string[]> = {
  pen: [
    '.....#.....',
    '.....#.....',
    '....###....',
    '....#+#....',
    '...##+##...',
    '...#.+.#...',
    '..##.+.##..',
    '..#..#..#..',
    '.##.....##.',
    '.#########.',
    '.#.......#.',
    '.#########.',
  ],
  bug: [
    '#..#....#..#',
    '.#..####..#.',
    '...######...',
    '#.##+##+##.#',
    '.##########.',
    '...######...',
    '#.########.#',
    '.#.######.#.',
    '#...####...#',
  ],
  clock: [
    '..######..',
    '.#......#.',
    '#....+...#',
    '#....+...#',
    '#....+++.#',
    '#........#',
    '#........#',
    '.#......#.',
    '..######..',
  ],
  coffee: [
    '..#.#.#...',
    '.#.#.#....',
    '..........',
    '#######...',
    '#+++++####',
    '#+++++#..#',
    '#+++++####',
    '.#####....',
  ],
};

function drawSprite(ctx: CanvasRenderingContext2D, sprite: string[], x: number, y: number, px: number, ink: string, accent: string) {
  for (let j = 0; j < sprite.length; j++) {
    const row = sprite[j]!;
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === '#' || ch === '+') {
        ctx.fillStyle = ch === '#' ? ink : accent;
        ctx.fillRect(x + i * px, y + j * px, px, px);
      }
    }
  }
}

/** Tiny Web Audio synth — no sound files. */
class Sfx {
  private ctx: AudioContext | null = null;
  muted: boolean;
  constructor(muted: boolean) { this.muted = muted; }
  unlock(): void {
    if (this.ctx) { void this.ctx.resume(); return; }
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctor) this.ctx = new Ctor();
  }
  private tone(f1: number, f2: number, dur: number, type: OscillatorType, gain = 0.05, delay = 0) {
    if (this.muted || !this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f1, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }
  shoot() { this.tone(1200, 600, 0.06, 'square', 0.025); }
  pop() { this.tone(520, 180, 0.12, 'square', 0.05); }
  hurt() { this.tone(220, 60, 0.35, 'sawtooth', 0.07); }
  pickup() { this.tone(660, 1320, 0.16, 'triangle', 0.07); }
  win() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, f, 0.18, 'square', 0.05, i * 0.12)); }
  lose() { [392, 330, 262, 196].forEach((f, i) => this.tone(f, f * 0.98, 0.22, 'triangle', 0.06, i * 0.16)); }
  close() { void this.ctx?.close(); }
}

export class DesignerSurvival {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly opts: GameOptions;
  private readonly sfx: Sfx;
  private status: GameStatus = 'ready';
  private raf = 0;
  private last = 0;
  private scale = 1;

  // state
  private px = W / 2;
  private targetX: number | null = null;
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private particles: Particle[] = [];
  private elapsed = 0;
  private score = 0;
  private lives = MAX_LIVES;
  private best = 0;
  private newBest = false;
  private spawnIn = 0.6;
  private coffeeIn = 18;
  private cooldown = 0;
  private invuln = 0;
  private shake = 0;
  private message: string | null = null;
  private messageT = 0;
  private gridY = 0;
  private keys = new Set<string>();
  private dragging = false;
  private lastSnap = '';
  private ro: ResizeObserver;

  constructor(canvas: HTMLCanvasElement, opts: GameOptions) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D not supported');
    this.canvas = canvas;
    this.ctx = ctx;
    this.opts = opts;
    this.sfx = new Sfx(opts.muted);
    try { this.best = Number(localStorage.getItem(BEST_KEY)) || 0; } catch { this.best = 0; }

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    this.resize();

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    document.addEventListener('visibilitychange', this.onBlur);
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);

    this.reset();
    this.render();
    this.emit(true);
  }

  // ── public API ──────────────────────────────────────────────────

  start(): void {
    this.sfx.unlock();
    if (this.status === 'playing') return;
    if (this.status !== 'paused') this.reset();
    this.status = 'playing';
    this.last = performance.now();
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(this.loop);
    this.emit(true);
  }

  pause(): void {
    if (this.status !== 'playing') return;
    this.status = 'paused';
    cancelAnimationFrame(this.raf);
    this.render();
    this.emit(true);
  }

  togglePause(): void {
    if (this.status === 'playing') this.pause();
    else if (this.status === 'paused') this.start();
  }

  restart(): void {
    this.status = 'ready';
    this.start();
  }

  setMuted(m: boolean): void { this.sfx.muted = m; }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    document.removeEventListener('visibilitychange', this.onBlur);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    this.sfx.close();
  }

  // ── input ───────────────────────────────────────────────────────

  private onKeyDown = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    // Leave keyboard navigation of dialog buttons intact.
    const onButton = (e.target as HTMLElement | null)?.closest?.('button, a');
    if (['arrowleft', 'arrowright', 'a', 'd', ' ', 'arrowup', 'w'].includes(k) && !onButton) e.preventDefault();
    if (k === 'p') { this.togglePause(); return; }
    if (k === 'r' && (this.status === 'won' || this.status === 'lost' || this.status === 'paused')) { this.restart(); return; }
    if ((k === ' ' || k === 'enter') && this.status === 'ready' && !onButton) { this.start(); return; }
    this.keys.add(k);
  };
  private onKeyUp = (e: KeyboardEvent) => { this.keys.delete(e.key.toLowerCase()); };
  private onBlur = () => { this.keys.clear(); this.dragging = false; if (document.hidden || !document.hasFocus()) this.pause(); };

  private toLogicalX(e: PointerEvent): number {
    const r = this.canvas.getBoundingClientRect();
    return ((e.clientX - r.left) / r.width) * W;
  }
  private onPointerDown = (e: PointerEvent) => {
    this.dragging = true;
    this.targetX = this.toLogicalX(e);
    this.canvas.setPointerCapture?.(e.pointerId);
    if (this.status === 'ready') this.start();
  };
  private onPointerMove = (e: PointerEvent) => {
    if (this.dragging || e.pointerType === 'mouse') this.targetX = this.toLogicalX(e);
  };
  private onPointerUp = () => { this.dragging = false; };

  // ── loop ────────────────────────────────────────────────────────

  private resize(): void {
    const r = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1, Math.round(r.width * dpr));
    this.canvas.height = Math.max(1, Math.round(r.height * dpr));
    this.scale = (r.width * dpr) / W;
    if (this.status !== 'playing') this.render();
  }

  private reset(): void {
    this.px = W / 2;
    this.targetX = null;
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.elapsed = 0;
    this.score = 0;
    this.lives = MAX_LIVES;
    this.spawnIn = 0.6;
    this.coffeeIn = 16 + Math.random() * 8;
    this.cooldown = 0;
    this.invuln = 0;
    this.message = null;
    this.newBest = false;
  }

  private loop = (now: number) => {
    if (this.status !== 'playing') return;
    const dt = Math.min(1 / 30, (now - this.last) / 1000);
    this.last = now;
    this.update(dt);
    this.render();
    this.emit();
    if (this.status === 'playing') this.raf = requestAnimationFrame(this.loop);
  };

  private difficulty(): number { return Math.min(1, this.elapsed / DURATION); }

  private spawn(): void {
    const d = this.difficulty();
    const s = this.elapsed;
    const pool: Kind[] = ['bug', 'bug', 'deadline'];
    if (s > 7) pool.push('feedback');
    if (s > 14) pool.push('pixel', 'pixel');
    if (s > 21) pool.push('change');
    if (s > 30) pool.push('request');
    const kind = pool[Math.floor(Math.random() * pool.length)]!;
    const speed = 1 + d * 0.9;
    const dims: Record<Kind, [number, number]> = {
      bug: [24, 18], deadline: [20, 18], feedback: [52, 20], pixel: [14, 14],
      change: [66, 20], request: [92, 24], coffee: [20, 16],
    };
    const [w, h] = dims[kind];
    const vy = { bug: 70, deadline: 150, feedback: 60, pixel: 95, change: 80, request: 42, coffee: 70 }[kind] * speed;
    const hp = { bug: 1, deadline: 1, feedback: 2, pixel: 1, change: 2, request: 4, coffee: 1 }[kind];
    this.enemies.push({
      kind, w, h, hp, vy,
      x: 6 + Math.random() * (W - w - 12), y: -h - 4,
      vx: kind === 'pixel' ? (Math.random() - 0.5) * 60 : 0,
      t: 0, seed: Math.random() * 10, flash: 0,
    });
  }

  private update(dt: number): void {
    this.elapsed += dt;
    this.gridY = (this.gridY + dt * (18 + this.difficulty() * 30)) % 24;
    if (this.messageT > 0) this.messageT -= dt; else this.message = null;
    if (this.invuln > 0) this.invuln -= dt;
    if (this.shake > 0) this.shake -= dt;

    // Win condition — survived the iteration
    if (this.elapsed >= DURATION) {
      this.score += this.lives * 100;
      this.finish('won');
      return;
    }

    // Player
    const left = this.keys.has('arrowleft') || this.keys.has('a');
    const right = this.keys.has('arrowright') || this.keys.has('d');
    if (left || right) {
      this.targetX = null;
      this.px += (right ? 1 : -1) * 270 * dt;
    } else if (this.targetX !== null) {
      this.px += (this.targetX - this.px) * Math.min(1, dt * 14);
    }
    this.px = Math.max(14, Math.min(W - 14, this.px));

    // Fire: hold space / up, or auto-fire while dragging (touch)
    this.cooldown -= dt;
    const firing = this.keys.has(' ') || this.keys.has('arrowup') || this.keys.has('w') || this.dragging;
    if (firing && this.cooldown <= 0) {
      this.bullets.push({ x: this.px, y: H - 52 });
      this.cooldown = 0.2;
      this.sfx.shoot();
    }
    for (const b of this.bullets) b.y -= 440 * dt;
    this.bullets = this.bullets.filter((b) => b.y > -10);

    // Spawning
    this.spawnIn -= dt;
    if (this.spawnIn <= 0) {
      this.spawn();
      const d = this.difficulty();
      this.spawnIn = (1.05 - d * 0.7) * (0.7 + Math.random() * 0.6);
    }
    this.coffeeIn -= dt;
    if (this.coffeeIn <= 0) {
      this.enemies.push({ kind: 'coffee', x: 20 + Math.random() * (W - 40), y: -20, w: 20, h: 16, vx: 0, vy: 75, hp: 1, t: 0, seed: 0, flash: 0 });
      this.coffeeIn = 15 + Math.random() * 10;
    }

    // Enemies
    const py = H - 46;
    for (const e of this.enemies) {
      e.t += dt;
      if (e.flash > 0) e.flash -= dt;
      if (e.kind === 'bug') e.vx = Math.sin(e.t * 3 + e.seed) * 60;
      if (e.kind === 'change' && !e.dashed && e.y > H * 0.35) {
        e.dashed = true; // the last-minute change: swerves without warning
        e.vx = (e.x + e.w / 2 < this.px ? 1 : -1) * 140;
      }
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      if (e.x < 2 || e.x + e.w > W - 2) { e.vx *= -1; e.x = Math.max(2, Math.min(W - e.w - 2, e.x)); }
    }

    // Bullet collisions
    for (const b of this.bullets) {
      for (const e of this.enemies) {
        if (e.hp <= 0 || e.kind === 'coffee') continue;
        if (b.x > e.x - 2 && b.x < e.x + e.w + 2 && b.y > e.y && b.y < e.y + e.h + 6) {
          b.y = -100;
          e.hp--;
          e.flash = 0.08;
          if (e.hp <= 0) this.kill(e);
          else this.sfx.pop();
          break;
        }
      }
    }

    // Player collisions
    for (const e of this.enemies) {
      if (e.hp <= 0) continue;
      const hit = e.x < this.px + 10 && e.x + e.w > this.px - 10 && e.y + e.h > py && e.y < py + 22;
      if (!hit) continue;
      if (e.kind === 'coffee') {
        e.hp = 0;
        if (this.lives < MAX_LIVES) this.lives++; else this.score += 50;
        this.say('COFFEE BREAK. +1 LIFE.');
        this.sfx.pickup();
        continue;
      }
      if (this.invuln > 0) continue;
      e.hp = 0;
      this.burst(e, C.ink);
      this.lives--;
      this.invuln = 1.3;
      this.shake = this.opts.reducedMotion ? 0 : 0.25;
      this.say(MESSAGES[e.kind]);
      this.sfx.hurt();
      if (this.lives <= 0) { this.finish('lost'); return; }
    }

    this.enemies = this.enemies.filter((e) => e.hp > 0 && e.y < H + 30);

    // Particles
    for (const p of this.particles) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 260 * dt; p.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);

    // Survival points
    this.score += dt * 5;
  }

  private kill(e: Enemy): void {
    this.score += POINTS[e.kind];
    this.burst(e, C.green);
    this.sfx.pop();
    if (e.kind === 'pixel' && !e.mini) {
      // Pixel errors split into smaller pixel errors
      for (const dir of [-1, 1]) {
        this.enemies.push({ kind: 'pixel', mini: true, x: e.x + e.w / 2, y: e.y, w: 8, h: 8, vx: dir * 80, vy: e.vy * 1.1, hp: 1, t: 0, seed: 0, flash: 0 });
      }
    }
  }

  private burst(e: Enemy, c: string): void {
    const n = this.opts.reducedMotion ? 4 : 10;
    for (let i = 0; i < n; i++) {
      this.particles.push({
        x: e.x + e.w / 2, y: e.y + e.h / 2,
        vx: (Math.random() - 0.5) * 220, vy: (Math.random() - 0.8) * 200,
        life: 0.35 + Math.random() * 0.3, c,
      });
    }
  }

  private say(msg: string): void { this.message = msg; this.messageT = 2.2; }

  private finish(status: 'won' | 'lost'): void {
    this.status = status;
    this.score = Math.round(this.score);
    if (this.score > this.best) {
      this.best = this.score;
      this.newBest = true;
      try { localStorage.setItem(BEST_KEY, String(this.best)); } catch { /* storage unavailable */ }
    }
    if (status === 'won') this.sfx.win(); else this.sfx.lose();
    this.keys.clear();
    this.render();
    this.emit(true);
  }

  private emit(force = false): void {
    const snap: GameSnapshot = {
      status: this.status,
      score: Math.floor(this.score),
      best: this.best,
      time: Math.max(0, Math.ceil(DURATION - this.elapsed)),
      lives: this.lives,
      message: this.message,
      newBest: this.newBest,
    };
    const key = JSON.stringify(snap);
    if (!force && key === this.lastSnap) return;
    this.lastSnap = key;
    this.opts.onChange(snap);
  }

  // ── render ──────────────────────────────────────────────────────

  private render(): void {
    const { ctx } = this;
    const s = this.scale;
    let ox = 0;
    let oy = 0;
    if (this.shake > 0) { ox = (Math.random() - 0.5) * 6; oy = (Math.random() - 0.5) * 6; }
    ctx.setTransform(s, 0, 0, s, ox * s, oy * s);
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = C.bg;
    ctx.fillRect(-10, -10, W + 20, H + 20);

    // Moving grid — the technical environment
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1 / s;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 24) { ctx.moveTo(x + 0.5 / s, 0); ctx.lineTo(x + 0.5 / s, H); }
    for (let y = -24 + this.gridY; y <= H; y += 24) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();

    // Bottom baseline
    ctx.fillStyle = C.green;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(0, H - 14, W, 1);
    ctx.globalAlpha = 1;

    for (const e of this.enemies) this.drawEnemy(e);

    ctx.fillStyle = C.green;
    for (const b of this.bullets) ctx.fillRect(b.x - 1.5, b.y, 3, 8);

    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life * 2);
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x, p.y, 3, 3);
    }
    ctx.globalAlpha = 1;

    // Player (blinks while invulnerable)
    if (this.invuln <= 0 || Math.floor(this.invuln * 12) % 2 === 0) {
      drawSprite(ctx, SPRITES.pen, this.px - 11, H - 46, 2, C.ink, C.green);
    }

    // Message toast
    if (this.message && this.status === 'playing') {
      ctx.font = '700 11px "DM Sans", system-ui, sans-serif';
      const tw = ctx.measureText(this.message).width;
      const bw = Math.min(W - 24, tw + 20);
      const bx = (W - bw) / 2;
      ctx.fillStyle = C.green;
      ctx.fillRect(bx, 18, bw, 26);
      ctx.fillStyle = C.black;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.message, W / 2, 31.5, W - 32);
    }
  }

  private drawEnemy(e: Enemy): void {
    const { ctx } = this;
    const ink = e.flash > 0 ? C.green : C.ink;
    switch (e.kind) {
      case 'bug':
        drawSprite(ctx, SPRITES.bug, e.x, e.y, 2, ink, C.green);
        break;
      case 'deadline':
        drawSprite(ctx, SPRITES.clock, e.x, e.y, 2, ink, C.green);
        break;
      case 'coffee':
        drawSprite(ctx, SPRITES.coffee, e.x, e.y, 2, C.green, C.ink);
        break;
      case 'pixel': {
        // Glitching misaligned square
        const j = Math.sin(e.t * 30 + e.seed) > 0.6 ? 2 : 0;
        ctx.fillStyle = C.green;
        ctx.fillRect(e.x + j, e.y, e.w, e.h);
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1;
        ctx.strokeRect(e.x - j + 0.5, e.y + 2.5, e.w - 1, e.h - 1);
        break;
      }
      default: {
        const label = e.kind === 'feedback' ? 'MEH.' : e.kind === 'change' ? 'V2_FINAL_FINAL' : 'MAKE IT POP!';
        ctx.fillStyle = e.kind === 'request' ? C.ink : C.bg;
        ctx.fillRect(e.x, e.y, e.w, e.h);
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(e.x + 0.75, e.y + 0.75, e.w - 1.5, e.h - 1.5);
        if (e.kind === 'feedback') {
          // speech-bubble tail
          ctx.fillStyle = ink;
          ctx.fillRect(e.x + 8, e.y + e.h, 4, 4);
        }
        ctx.fillStyle = e.kind === 'request' ? C.black : ink;
        ctx.font = '700 9px "DM Sans", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, e.x + e.w / 2, e.y + e.h / 2 + 0.5, e.w - 6);
        // HP pips
        for (let i = 0; i < e.hp - 1; i++) {
          ctx.fillStyle = C.green;
          ctx.fillRect(e.x + e.w - 6 - i * 5, e.y - 5, 3, 3);
        }
      }
    }
  }
}
