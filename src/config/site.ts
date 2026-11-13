import type { Localized, SocialLink } from '../types/content.ts';

/**
 * ─────────────────────────────────────────────────────────────────────
 *  SITE CONFIGURATION — edit this file to update personal information.
 *  `null` values are rendered as clearly marked "PENDING" placeholders.
 *  Never add a URL or address that is not real.
 * ─────────────────────────────────────────────────────────────────────
 */
export const site = {
  name: 'ONA',
  /** Brand signature (logo wordmark, footer, copyright). */
  brand: 'GEMINISOBF.DEV',
  fullName: 'Ona',
  title: 'UX/UI Designer & Creative Technologist',

  /** Absolute production URL — set SITE_URL in .env (see .env.example). */
  url: (import.meta.env.SITE_URL as string | undefined) ?? '',

  location: null as Localized | null, // e.g. { en: 'Barcelona', es: 'Barcelona' } — PENDING
  availability: null as Localized | null, // e.g. { en: 'Open to opportunities', es: 'Disponible' } — PENDING

  social: [
    { id: 'email', label: 'Email', href: null }, // 'mailto:you@domain.com' — PENDING
    { id: 'instagram', label: 'Instagram', href: null }, // 'https://www.instagram.com/…' — PENDING
    { id: 'linkedin', label: 'LinkedIn', href: null }, // 'https://www.linkedin.com/in/…' — PENDING
    { id: 'github', label: 'GitHub', href: null }, // 'https://github.com/…' — PENDING
  ] satisfies SocialLink[] as SocialLink[],

  seo: {
    title: 'ONA — UX/UI Designer & Creative Technologist',
    description: {
      en: 'Portfolio of Ona, a UX/UI and graphic designer exploring the intersection of art, technology and digital experiences.',
      es: 'Portfolio de Ona, diseñadora UX/UI y gráfica que explora la intersección entre arte, tecnología y experiencias digitales.',
    } satisfies Localized,
    ogImage: 'og-image.png',
    themeColor: '#00231F',
  },
} as const;

export function socialHref(id: SocialLink['id']): string | null {
  return site.social.find((s) => s.id === id)?.href ?? null;
}
