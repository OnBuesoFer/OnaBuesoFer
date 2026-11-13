import { useId } from 'react';
// The brand logo, imported directly from its original location (the file is never modified).
import logoSvg from '../../media/geminisobfFavicon.svg?raw';

/**
 * Brand logo, inlined so CSS can adapt its two colours to the surface:
 *   ink (shapes + wordmark) → var(--logo-ink)  · original #00231F
 *   knockout ("OBF.DEV")    → var(--logo-knock) · original white
 * Proportions come from the SVG's own viewBox (439 × 220); size it by
 * height or width only. The clipPath id is made unique per instance so
 * the logo can appear several times on one page.
 */
const CLIP_ID = 'clip0_2293_1263';
const SVG_BODY = logoSvg
  .replace(/<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '')
  .replace(/fill="#00231F"/g, 'class="logo__ink"')
  .replace(/(<path[^>]*?)fill="white"/g, '$1class="logo__knock"');
const VIEWBOX = /viewBox="([^"]+)"/.exec(logoSvg)?.[1] ?? '0 0 439 220';

export function Logo({ className = '' }: { className?: string }) {
  const uid = `logo-clip-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <svg
      className={`logo ${className}`}
      viewBox={VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: SVG_BODY.replaceAll(CLIP_ID, uid) }}
    />
  );
}
