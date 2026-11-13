/**
 * Generates responsive AVIF/WebP variants for every PUBLISHED project image
 * (listed in src/config/projects.ts) into public/generated/projectes/.
 * Originals in src/media/projectes/ are only read, never modified.
 * Private files that are not listed in projects.ts are never processed.
 *
 *   node scripts/optimize-images.ts
 */
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import sharp from 'sharp';
import { projects } from '../src/config/projects.ts';
import { services, workCategories } from '../src/config/services.ts';
import type { ProjectImage } from '../src/types/content.ts';

const ROOT = resolve(import.meta.dirname, '..');
const SRC = join(ROOT, 'src/media/projectes');
const OUT = join(ROOT, 'public/generated/projectes');
const WIDTHS = [640, 1080, 1600]; // keep in sync with src/lib/media.ts
const stem = (f: string) => f.replace(/\.[a-z0-9]+$/i, '').replace(/[^a-z0-9_-]+/gi, '-');

mkdirSync(OUT, { recursive: true });

const images: ProjectImage[] = [
  ...projects.flatMap((p) => [
    ...(p.cover ? [p.cover] : []),
    ...(p.gallery ?? []),
    ...(p.sections ?? []).flatMap((s) => [...(s.images ?? []), ...(s.diagrams ?? [])]),
  ]),
  ...services.flatMap((s) => s.media.flatMap((m) => (m.image ? [m.image] : []))),
  ...workCategories.flatMap((c) => c.projects.flatMap((p) => (p.image ? [p.image] : []))),
];

const fresh = (out: string, src: string) => existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs;

let made = 0;
for (const img of images) {
  const src = join(SRC, img.file);
  if (!existsSync(src)) {
    console.warn(`  ⚠ missing source image: src/media/projectes/${img.file}`);
    continue;
  }
  const meta = await sharp(src).metadata();
  if (meta.width !== img.width || meta.height !== img.height) {
    console.warn(`  ⚠ ${img.file}: real size ${meta.width}×${meta.height} ≠ projects.ts ${img.width}×${img.height}`);
  }
  const jobs: Promise<unknown>[] = [];
  // Same rule as widthsFor() in src/lib/media.ts
  const widths = WIDTHS.filter((w) => w <= img.width);
  if (img.width < WIDTHS[WIDTHS.length - 1]! && !widths.includes(img.width)) widths.push(img.width);
  for (const w of widths) {
    for (const fmt of ['avif', 'webp'] as const) {
      const out = join(OUT, `${stem(img.file)}-${w}.${fmt}`);
      if (fresh(out, src)) continue;
      const pipe = sharp(src, { limitInputPixels: false }).resize({ width: w });
      jobs.push((fmt === 'avif' ? pipe.avif({ quality: 52, effort: 4 }) : pipe.webp({ quality: 78 })).toFile(out));
      made++;
    }
  }
  // 16:10 poster from the top of the page (previews + Open Graph)
  const posterH = Math.round(img.width * (10 / 16));
  for (const w of [960, 1200] as const) {
    for (const fmt of ['avif', 'webp', 'jpg'] as const) {
      const out = join(OUT, `${stem(img.file)}-poster-${w}.${fmt}`);
      if (fresh(out, src)) continue;
      const pipe = sharp(src)
        .extract({ left: 0, top: 0, width: img.width, height: Math.min(posterH, img.height) })
        .resize({ width: w });
      const enc = fmt === 'avif' ? pipe.avif({ quality: 55 }) : fmt === 'webp' ? pipe.webp({ quality: 80 }) : pipe.jpeg({ quality: 84, mozjpeg: true });
      jobs.push(enc.toFile(out));
      made++;
    }
  }
  await Promise.all(jobs);
}
console.log(made ? `✓ images: ${made} variants generated` : '✓ images: up to date');
