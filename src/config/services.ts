import type { Localized, ProjectImage } from '../types/content.ts';

/**
 * ─────────────────────────────────────────────────────────────────────
 *  PROJECTS & SERVICES PAGE — all content lives here.
 *
 *  • Services: photography and digital design are the main offering.
 *    Add real photos to `media` (files in src/media/…); empty slots render
 *    as framed "image pending" placeholders.
 *  • Additional work: add projects to a category's `projects` array.
 *    Categories without projects show "in preparation".
 *  • Never add clients, brands, results or datasets that are not real.
 * ─────────────────────────────────────────────────────────────────────
 */

export interface MediaSlot {
  /** Image when available; `null` renders a marked placeholder. */
  image: ProjectImage | null;
  ratio: '4/5' | '3/2' | '16/10' | '1/1';
  caption: Localized;
}

export interface Service {
  id: string;
  code: string;
  name: Localized;
  statement: Localized;
  offerings: Localized[];
  media: MediaSlot[];
}

export interface ExtraProject {
  title: string;
  description: Localized;
  image: ProjectImage | null;
  year?: number;
  /** Internal path (e.g. '/work/slug/') or external URL. */
  href?: string;
}

export interface WorkCategory {
  id: string;
  name: Localized;
  projects: ExtraProject[];
  /** Points to work already published elsewhere on the site. */
  seeAlso?: { label: Localized; anchor: 'work' };
}

export const servicesPage = {
  intro: {
    lines: {
      en: ['Photography.', 'Digital design.', 'A technical mind behind both.'],
      es: ['Fotografía.', 'Diseño digital.', 'Una mente técnica detrás de ambos.'],
    } as Record<'en' | 'es', string[]>,
    body: {
      en: 'I work where the image and the system meet. My main practice is photography and digital design — creating images, identities and visual content with intention. My training in graphic and interactive design, and in multiplatform application development, gives that work structure: a precise eye for detail and an understanding of the digital platforms it lives on.',
      es: 'Trabajo donde se encuentran la imagen y el sistema. Mi práctica principal es la fotografía y el diseño digital: crear imágenes, identidades y contenido visual con intención. Mi formación en diseño gráfico e interactivo y en desarrollo de aplicaciones multiplataforma le da estructura a ese trabajo: una mirada precisa al detalle y una comprensión de las plataformas digitales en las que vive.',
    } satisfies Localized,
    complementary: {
      en: ['UX/UI', 'Development · DAM', 'Systems · ASIR', 'Data'],
      es: ['UX/UI', 'Desarrollo · DAM', 'Sistemas · ASIR', 'Datos'],
    } as Record<'en' | 'es', string[]>,
  },
  updated: '2026-11-13',
};

export const services: Service[] = [
  {
    id: 'photography',
    code: 'PH',
    name: { en: 'Photography', es: 'Fotografía' },
    statement: {
      en: 'Images built with care for light, composition and detail — for brands, projects and digital platforms.',
      es: 'Imágenes construidas con cuidado por la luz, la composición y el detalle — para marcas, proyectos y plataformas digitales.',
    },
    offerings: [
      { en: 'Professional photography', es: 'Fotografía profesional' },
      { en: 'Creative and artistic photography', es: 'Fotografía creativa y artística' },
      { en: 'Product and detail photography', es: 'Fotografía de producto y detalle' },
      { en: 'Visual storytelling', es: 'Narrativa visual' },
      { en: 'Digital image editing and post-production', es: 'Edición digital y postproducción' },
      { en: 'Photography for brands, projects and digital platforms', es: 'Fotografía para marcas, proyectos y plataformas digitales' },
    ],
    media: [
      { image: null, ratio: '4/5', caption: { en: 'Portrait format', es: 'Formato vertical' } },
      { image: null, ratio: '3/2', caption: { en: 'Landscape format', es: 'Formato horizontal' } },
    ],
  },
  {
    id: 'design',
    code: 'DD',
    name: { en: 'Digital Design', es: 'Diseño digital' },
    statement: {
      en: 'Visual systems and content that communicate clearly — from identity to the everyday assets a project needs.',
      es: 'Sistemas visuales y contenido que comunican con claridad — desde la identidad hasta las piezas que un proyecto necesita cada día.',
    },
    offerings: [
      { en: 'Graphic design', es: 'Diseño gráfico' },
      { en: 'Visual identity and branding', es: 'Identidad visual y branding' },
      { en: 'Digital compositions', es: 'Composiciones digitales' },
      { en: 'Creative direction', es: 'Dirección creativa' },
      { en: 'Social media design', es: 'Diseño para redes sociales' },
      { en: 'Editorial and visual communication', es: 'Diseño editorial y comunicación visual' },
      { en: 'Digital assets and visual content', es: 'Recursos digitales y contenido visual' },
    ],
    media: [
      { image: null, ratio: '16/10', caption: { en: 'Identity / composition', es: 'Identidad / composición' } },
      { image: null, ratio: '1/1', caption: { en: 'Social / digital asset', es: 'Redes / recurso digital' } },
    ],
  },
];

/** Additional work, grouped by discipline. Empty categories read "in preparation". */
export const workCategories: WorkCategory[] = [
  { id: 'photography', name: { en: 'Photography', es: 'Fotografía' }, projects: [] },
  { id: 'graphic', name: { en: 'Graphic design', es: 'Diseño gráfico' }, projects: [] },
  { id: 'experimental', name: { en: 'Experimental visual work', es: 'Trabajo visual experimental' }, projects: [] },
  { id: 'personal', name: { en: 'Personal creative projects', es: 'Proyectos creativos personales' }, projects: [] },
  {
    id: 'uxui',
    name: { en: 'UX/UI & digital experiences', es: 'UX/UI y experiencias digitales' },
    projects: [],
    seeAlso: { label: { en: 'Selected Work', es: 'Proyectos seleccionados' }, anchor: 'work' },
  },
  { id: 'software', name: { en: 'Software development', es: 'Desarrollo de software' }, projects: [] },
  { id: 'data', name: { en: 'Data analysis & technical experiments', es: 'Análisis de datos y experimentos técnicos' }, projects: [] },
];
