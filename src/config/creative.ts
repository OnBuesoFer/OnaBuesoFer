import type { Localized, ProjectImage } from '../types/content.ts';

/**
 * ─────────────────────────────────────────────────────────────────────
 *  04 — CREATIVE PROJECTS & EXPLORATION (home page)
 *  Exactly four personal projects. Fill in each slot:
 *    title       → project name
 *    description → text revealed by the «+» button
 *    image       → { file, width, height, alt } in src/media/projectes/
 *  Empty fields render as clearly marked placeholders.
 * ─────────────────────────────────────────────────────────────────────
 */
export interface CreativeProject {
  id: string;
  title: Localized | null;
  description: Localized | null;
  image: ProjectImage | null;
}

export const creativeProjects: CreativeProject[] = [
  { id: 'creative-01', title: null, description: null, image: null },
  { id: 'creative-02', title: null, description: null, image: null },
  { id: 'creative-03', title: null, description: null, image: null },
  { id: 'creative-04', title: null, description: null, image: null },
];
