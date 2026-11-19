import type { Localized, ProjectImage } from '../types/content.ts';

/**
 * ─────────────────────────────────────────────────────────────────────
 *  GRAPHIC DESIGN GALLERY (Projects & Services page)
 *  Add a project by appending an entry. The first image is the cover;
 *  add more images for the different applications / pieces of a project.
 *  Images keep their original proportions everywhere (never stretched).
 *  While there are fewer than `minSlots` projects, marked placeholders
 *  keep the gallery composition complete.
 * ─────────────────────────────────────────────────────────────────────
 */
export interface GraphicProject {
  id: string;
  title: Localized;
  description: Localized;
  images: ProjectImage[]; // ≥ 1
  year?: number;
}

export const graphicProjects: GraphicProject[] = [];

export const minSlots = 3;
