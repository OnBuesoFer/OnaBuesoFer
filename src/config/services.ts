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
  /** Frame ratio. 'auto' = the image's own proportions (no crop). */
  ratio: '4/5' | '3/2' | '16/10' | '1/1' | 'auto';
  caption: Localized;
}

export interface Service {
  id: string;
  code: string;
  /** Section title. Optional: omit it to show the block without a heading. */
  name?: Localized;
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
    statement: {
      en: 'Images crafted in every detail, where light, composition and visual sensitivity shape the essence of each brand and project.',
      es: 'Imágenes cuidadas en cada detalle, donde la luz, la composición y la sensibilidad visual dan forma a la esencia de cada marca y proyecto.',
    },
    offerings: [
      { en: 'Professional photography', es: 'Fotografía profesional' },
      { en: 'Product and detail photography', es: 'Fotografía de producto y detalle' },
      { en: 'Visual storytelling', es: 'Narrativa visual' },
      { en: 'Digital image editing and post-production', es: 'Edición digital y postproducción' },
      { en: 'Photography for brands, projects and digital platforms', es: 'Fotografía para marcas, proyectos y plataformas digitales' },
    ],
    media: [
      {
        image: {
          file: 'pg/Boda01.jpg',
          width: 3456,
          height: 4320,
          alt: {
            en: 'Black-and-white wedding portrait: the bride laughing, holding her bouquet.',
            es: 'Retrato de boda en blanco y negro: la novia riendo con el ramo en las manos.',
          },
        },
        ratio: '4/5',
        caption: { en: 'Portrait format', es: 'Formato vertical' },
      },
      {
        image: {
          file: 'pg/Boda02.jpg',
          width: 3689,
          height: 3689,
          alt: {
            en: 'Wedding detail: red roses tied with a white ribbon beside a wooden ring box.',
            es: 'Detalle de boda: rosas rojas atadas con un lazo blanco junto a una caja de anillos de madera.',
          },
        },
        ratio: '3/2',
        caption: { en: 'Landscape format', es: 'Formato horizontal' },
      },
    ],
  },
  {
    id: 'design',
    code: 'DD',
    name: { en: 'Digital Design', es: 'Diseño digital' },
    statement: {
      en: 'Visual identities and digital solutions that communicate with clarity and coherence, from the brand concept to every piece that brings the project to life.',
      es: 'Identidades visuales y soluciones digitales que comunican con claridad y coherencia, desde el concepto de marca hasta cada pieza que da vida al proyecto.',
    },
    offerings: [
      { en: 'Graphic design', es: 'Diseño gráfico' },
      { en: 'Visual identity and branding', es: 'Identidad visual y branding' },
      { en: 'Digital compositions', es: 'Composiciones digitales' },
      { en: 'Editorial and visual communication', es: 'Diseño editorial y comunicación visual' },
      { en: 'Digital assets and visual content', es: 'Recursos digitales y contenido visual' },
    ],
    media: [
      {
        image: {
          file: 'pg/DisseñoGeminis.png',
          width: 1024,
          height: 1024,
          alt: {
            en: 'GEMINISOBF.DEV brand identity mockup: green notebook with the logo, white shirt, pen and business card.',
            es: 'Mockup de identidad de marca GEMINISOBF.DEV: libreta verde con el logotipo, camisa blanca, bolígrafo y tarjeta.',
          },
        },
        ratio: 'auto',
        caption: { en: 'Identity / composition', es: 'Identidad / composición' },
      },
      {
        image: {
          file: 'pg/DisseñoNavidad.png',
          width: 4789,
          height: 7000,
          alt: {
            en: 'Poster design “Cheers to the New Year” with a martini glass illustration, shown in an illuminated frame.',
            es: 'Diseño de cartel «Cheers to the New Year» con la ilustración de una copa de martini, en un marco iluminado.',
          },
        },
        ratio: 'auto',
        caption: { en: 'Social / digital asset', es: 'Redes / recurso digital' },
      },
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
