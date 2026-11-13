import type { Project } from '../types/content.ts';

/**
 * ─────────────────────────────────────────────────────────────────────
 *  PROJECTS — add a project by appending one object to this array.
 *
 *  1. Drop the image(s) in src/media/projectes/ (any filename).
 *  2. Add an entry below with `cover: { file, width, height, alt }`.
 *  3. Run `npm run dev` — responsive AVIF/WebP versions are generated
 *     automatically into public/generated/ (git-ignored).
 *
 *  `discipline`: 'design' | 'development' (DAM) | 'systems' (ASIR).
 *  Technical projects can add `sections[].code` (editorial code excerpts)
 *  and `sections[].diagrams` (architecture / network images).
 *
 *  Only published projects belong here. Private / unpublished work
 *  (e.g. Projecte_Morph.png) must NOT be listed.
 * ─────────────────────────────────────────────────────────────────────
 */

const ACADEMIC = { en: 'Academic / Personal Project', es: 'Proyecto académico / personal' };
const REDESIGN = { en: '(Re)Design Web', es: '(Re)Diseño web' };
const WEB = { en: 'Web Design', es: 'Diseño web' };

export const projects: Project[] = [
  {
    slug: 'porsche-911',
    title: 'Porsche 911',
    discipline: 'design',
    category: REDESIGN,
    type: ACADEMIC,
    year: null,
    summary: {
      draft: true,
      en: 'A redesign concept for the Porsche 911 Carrera web experience: oversized “911” typography layered with the car, performance figures set as editorial data and a photographic narrative.',
      es: 'Concepto de rediseño de la experiencia web del Porsche 911 Carrera: tipografía “911” a gran escala superpuesta al coche, cifras de rendimiento tratadas como dato editorial y una narrativa fotográfica.',
    },
    cover: {
      file: 'Projectes_Porche.png',
      width: 1920,
      height: 5379,
      alt: {
        en: 'Full-page design of the Porsche 911 Carrera redesign: hero with the car over large 911 lettering, performance figures and editorial photography.',
        es: 'Diseño de página completa del rediseño del Porsche 911 Carrera: hero con el coche sobre la tipografía 911, cifras de rendimiento y fotografía editorial.',
      },
    },
    brandConcept: 'Porsche',
  },
  {
    slug: 'mwc',
    title: 'MWC',
    discipline: 'design',
    category: WEB,
    type: ACADEMIC,
    year: null,
    summary: {
      draft: true,
      en: 'A web design for Mobile World Congress Barcelona built on a strict modular grid, heavy typography and a colour-blocked geometric graphic system.',
      es: 'Diseño web para el Mobile World Congress de Barcelona construido sobre una retícula modular estricta, tipografía contundente y un sistema gráfico geométrico de bloques de color.',
    },
    cover: {
      file: 'Projectes_MWC.png',
      width: 1920,
      height: 2727,
      alt: {
        en: 'Full-page design for MWC Barcelona: modular grid header, bold headlines, geometric half-circle illustration and key event figures.',
        es: 'Diseño de página completa para el MWC Barcelona: cabecera en retícula modular, titulares contundentes, ilustración geométrica de semicírculos y cifras clave.',
      },
    },
    brandConcept: 'MWC / GSMA',
  },
  {
    slug: 'quantex-labs',
    title: 'QUANTEX Labs',
    discipline: 'design',
    category: WEB,
    type: ACADEMIC,
    year: null,
    summary: {
      draft: true,
      en: 'Case study in preparation.',
      es: 'Caso de estudio en preparación.',
    },
    cover: {
      file: 'Projecte_QUANTEXLabs.png',
      width: 1280,
      height: 4694,
      alt: {
        en: 'Full-page design for QUANTEX Labs, a fictional financial-intelligence company: dark hero with a 3D figure, solutions grid, data-to-decisions process, industries, insights and closing call to action.',
        es: 'Diseño de página completa para QUANTEX Labs, una empresa ficticia de inteligencia financiera: hero oscuro con figura 3D, cuadrícula de soluciones, proceso de datos a decisiones, sectores, artículos y llamada a la acción final.',
      },
    },
  },
  {
    slug: 'audi',
    title: 'Audi',
    discipline: 'design',
    category: WEB,
    type: ACADEMIC,
    year: null,
    summary: {
      draft: true,
      en: 'A web design for the Audi RS 3 Sportback: full-bleed photography, compact italic headlines and key performance data framed in an editorial layout.',
      es: 'Diseño web para el Audi RS 3 Sportback: fotografía a sangre, titulares compactos en cursiva y datos de rendimiento enmarcados en una maqueta editorial.',
    },
    cover: {
      file: 'Projectes_AUDI.png',
      width: 1920,
      height: 3278,
      alt: {
        en: 'Full-page design for the Audi RS 3 Sportback: green car hero, performance data, interior photography and section headlines.',
        es: 'Diseño de página completa para el Audi RS 3 Sportback: hero con el coche verde, datos de rendimiento, fotografía del interior y titulares de sección.',
      },
    },
    brandConcept: 'Audi',
  },
  {
    slug: 'nadie-dice-nada',
    title: 'Nadie Dice Nada',
    discipline: 'design',
    category: WEB,
    type: { en: 'Personal Project', es: 'Proyecto personal' },
    year: null,
    summary: {
      draft: true,
      en: 'Case study in preparation.',
      es: 'Caso de estudio en preparación.',
    },
    cover: {
      file: 'Projecte_NADIEDICENADA.png',
      width: 1728,
      height: 5774,
      alt: {
        en: 'Full-page design for Nadie Dice Nada: editorial title, colour-blocked cast cards, show sections, panel list, 2025 live shows and footer with oversized wordmark.',
        es: 'Diseño de página completa para Nadie Dice Nada: título editorial, tarjetas de colores del elenco, secciones del programa, lista de la mesa, shows en vivo de 2025 y pie con el nombre a gran escala.',
      },
    },
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getNeighbours(slug: string): { prev: Project; next: Project } {
  const i = projects.findIndex((p) => p.slug === slug);
  const n = projects.length;
  return { prev: projects[(i - 1 + n) % n]!, next: projects[(i + 1) % n]! };
}
