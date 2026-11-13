/**
 * Generates brand assets into public/ from the real brand fonts:
 *   og-image.png (1200×630), favicon-48.png, apple-touch-icon.png,
 *   icon-512.png, site.webmanifest.
 * The logo/favicon is the brand SVG src/media/geminisobfFavicon.svg — read only,
 * never modified. PNGs are letterboxed (contain) so its 439:220 ratio is kept.
 * Text is converted to vector paths (opentype.js) so the fonts themselves
 * are never shipped inside the images. Re-run with `npm run og`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import opentype from 'opentype.js';
import sharp from 'sharp';

const ROOT = resolve(import.meta.dirname, '..');
const PUB = join(ROOT, 'public');
// Fonts are re-parsed on every use: opentype.js resolves CFF glyph outlines
// lazily, and interleaving several parsed CFF fonts corrupts some glyphs.
type FontRef = string;
const parse = (p: FontRef): opentype.Font => {
  const buf = readFileSync(join(ROOT, 'src/media/tipografia', p));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
};
const NM_BOLD = 'NEUE MONTREAL/Neue Montreal Bold 700.otf';
const NM_MED = 'NEUE MONTREAL/Neue Montreal Medium 500.otf';
const NM_LIGHT_IT = 'NEUE MONTREAL/Neue Montreal Light Italic 300.otf';
const DM_BOLD = 'DM SANS/DMSans_18pt-Bold.ttf';

// Brand logo — read from its original location only.
const LOGO_FILE = join(ROOT, 'src/media/geminisobfFavicon.svg');
const LOGO_SRC = readFileSync(LOGO_FILE, 'utf8');
const [, , vbW, vbH] = (/viewBox="([^"]+)"/.exec(LOGO_SRC)?.[1] ?? '0 0 439 220').split(/\s+/).map(Number);
const LOGO = {
  w: vbW ?? 439,
  h: vbH ?? 220,
  /** Inner markup, recoloured in memory (ink = #00231F shapes, knock = white text). */
  body: (ink: string, knock: string) =>
    LOGO_SRC.replace(/<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
      .replace(/fill="#00231F"/g, `fill="${ink}"`)
      .replace(/(<path[^>]*?)fill="white"/g, `$1fill="${knock}"`),
};

const C = { deep: '#00231F', green: '#05D991', paper: '#E8E8E8', ink: '#000000', line: 'rgba(5,217,145,0.18)' };

/** Text → SVG path, with optional letter-spacing (in em). */
function text(ref: FontRef, str: string, x: number, y: number, size: number, fill: string, tracking = 0): { svg: string; width: number } {
  const f = parse(ref);
  let cursor = x;
  const parts: string[] = [];
  for (const ch of str) {
    const glyph = f.charToGlyph(ch);
    // Rounded origin: opentype.js can emit NaN for some long fractional positions.
    const d = glyph.getPath(Math.round(cursor * 4) / 4, y, size).toPathData(2);
    if (d) parts.push(`<path d="${d}"/>`); // one path per glyph keeps renderers robust
    cursor += (glyph.advanceWidth ?? 0) * (size / f.unitsPerEm) + tracking * size;
  }
  return { svg: `<g fill="${fill}">${parts.join('')}</g>`, width: cursor - x };
}

// ── Open Graph image ───────────────────────────────────────────────
function og(): string {
  const W = 1200;
  const H = 630;
  const M = 72;
  const els: string[] = [];
  // 12-column hairline grid
  for (let i = 0; i <= 12; i++) {
    const x = M + ((W - 2 * M) / 12) * i;
    els.push(`<rect x="${x.toFixed(1)}" y="0" width="1" height="${H}" fill="${C.line}"/>`);
  }
  // Organic contours (left side of motif) → quantized cells (right side)
  const cx = 860;
  const cy = 300;
  [70, 110, 150, 195].forEach((r, i) => {
    els.push(`<ellipse cx="${cx - 40}" cy="${cy}" rx="${r * 1.15}" ry="${r}" fill="none" stroke="${C.paper}" stroke-opacity="${0.55 - i * 0.1}" stroke-width="1.4"/>`);
  });
  const S = 28;
  for (let j = 0; j < 10; j++) {
    for (let i = 0; i < 9; i++) {
      const x = 840 + i * S;
      const y = 160 + j * S;
      const d = Math.hypot((x + S / 2 - (cx - 40)) / 1.15, y + S / 2 - cy);
      const stair = i + (9 - j) * 0.6 > 4;
      if (!stair || x > W - M) continue;
      els.push(`<rect x="${x + 0.5}" y="${y + 0.5}" width="${S - 1}" height="${S - 1}" fill="none" stroke="${C.paper}" stroke-opacity="0.16"/>`);
      if (Math.abs(d - 150) < 16 || Math.abs(d - 70) < 14) {
        els.push(`<rect x="${x + 2}" y="${y + 2}" width="${S - 4}" height="${S - 4}" fill="${C.green}"/>`);
      } else if (d < 150) {
        const inset = d < 70 ? 6 : 9;
        els.push(`<rect x="${x + inset}" y="${y + inset}" width="${S - 2 * inset}" height="${S - 2 * inset}" fill="none" stroke="${C.paper}" stroke-width="1.4"/>`);
      }
    }
  }
  // Top labels
  els.push(text(DM_BOLD, 'PORTFOLIO', M, 92, 15, C.green, 0.14).svg);
  els.push(text(DM_BOLD, 'ART × TECHNOLOGY', W - M - text(DM_BOLD, 'ART × TECHNOLOGY', 0, 0, 15, '', 0.14).width, 92, 15, C.paper, 0.14).svg);
  // Brand logo (recoloured in memory for the dark background; proportions kept)
  const logoH = 200;
  const logoW = (LOGO.w / LOGO.h) * logoH;
  els.push(`<svg x="${M}" y="150" width="${logoW.toFixed(1)}" height="${logoH}" viewBox="0 0 ${LOGO.w} ${LOGO.h}">${LOGO.body(C.paper, C.deep)}</svg>`);
  els.push(text(DM_BOLD, 'ONA — UX/UI DESIGNER & CREATIVE TECHNOLOGIST', M, 410, 19, C.paper, 0.12).svg);
  // Headline baseline
  els.push(`<rect x="${M}" y="488" width="${W - 2 * M}" height="1" fill="${C.paper}" fill-opacity="0.3"/>`);
  let x = M;
  for (const [f, s] of [[NM_MED, 'Art thinking. '], [NM_LIGHT_IT, 'Technical'], [NM_MED, ' mind. Digital experiences.']] as const) {
    const t = text(f, s, x, 552, 40, s === 'Technical' ? C.green : C.paper, -0.02);
    els.push(t.svg);
    x += t.width;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${C.deep}"/>${els.join('')}</svg>`;
}

const ogSvg = og();
if (process.env.OG_DEBUG) writeFileSync(process.env.OG_DEBUG, ogSvg);
await sharp(Buffer.from(ogSvg)).png({ compressionLevel: 9 }).toFile(join(PUB, 'og-image.png'));
// Favicon fallback + touch icons: the original SVG, letterboxed (never cropped or stretched).
async function square(size: number, pad: number, bg: string | null, out: string): Promise<void> {
  const inner = size - pad * 2;
  const logo = await sharp(LOGO_FILE, { density: 600 })
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: bg ?? { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: logo }])
    .png()
    .toFile(join(PUB, out));
}
await square(48, 1, null, 'favicon-48.png');
await square(180, 18, C.paper, 'apple-touch-icon.png'); // iOS needs an opaque tile
await square(512, 48, C.paper, 'icon-512.png');
writeFileSync(
  join(PUB, 'site.webmanifest'),
  JSON.stringify(
    {
      name: 'ONA — UX/UI Designer & Creative Technologist',
      short_name: 'ONA.',
      icons: [{ src: 'icon-512.png', sizes: '512x512', type: 'image/png' }, { src: 'apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
      theme_color: C.deep,
      background_color: C.paper,
      display: 'browser',
    },
    null,
    2,
  ),
);
console.log('✓ og-image.png, favicon PNGs and manifest generated in public/');
