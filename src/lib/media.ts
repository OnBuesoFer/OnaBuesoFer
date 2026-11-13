import type { ProjectImage } from '../types/content.ts';

/**
 * Responsive variants produced by scripts/optimize-images.ts.
 * Keep WIDTHS in sync with that script.
 */
export const WIDTHS = [640, 1080, 1600] as const;
export const FORMATS = ['avif', 'webp'] as const;

const BASE = import.meta.env.BASE_URL;

export function stem(file: string): string {
  return file.replace(/\.[a-z0-9]+$/i, '').replace(/[^a-z0-9_-]+/gi, '-');
}

export function variantUrl(file: string, width: number, format: string): string {
  return `${BASE}generated/projectes/${stem(file)}-${width}.${format}`;
}

/** Cropped top-of-page poster (16:10) used in previews and Open Graph. */
export function posterUrl(file: string, width: 960 | 1200, format: 'webp' | 'jpg' | 'avif'): string {
  return `${BASE}generated/projectes/${stem(file)}-poster-${width}.${format}`;
}

/** Standard widths up to the image's size, plus its native width when it is
 *  smaller than the largest standard width (so small images stay sharp). */
export function widthsFor(width: number): number[] {
  const ws: number[] = WIDTHS.filter((w) => w <= width);
  if (width < WIDTHS[WIDTHS.length - 1]! && !ws.includes(width)) ws.push(width);
  return ws;
}

export function srcSet(img: ProjectImage, format: string): string {
  return widthsFor(img.width)
    .map((w) => `${variantUrl(img.file, w, format)} ${w}w`)
    .join(', ');
}
