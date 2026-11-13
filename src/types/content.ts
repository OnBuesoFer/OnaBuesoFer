/**
 * Content model. Everything visitors read lives in /src/config and is typed
 * here, so components never hard-code copy.
 */

export type Lang = 'en' | 'es';
export const LANGS: readonly Lang[] = ['en', 'es'] as const;

/** A string in every supported language. */
export type Localized = Record<Lang, string>;

/** A value that is still missing. Rendered as a visible "PENDING" marker. */
export type Pending = null;

export interface SocialLink {
  id: 'email' | 'linkedin' | 'github' | 'instagram';
  label: string;
  /** Full URL (https://… or mailto:…). `null` = not provided yet. */
  href: string | Pending;
  /** Optional platform: never shown (not even as PENDING) until a real URL is set. */
  optional?: boolean;
}

export interface ProjectImage {
  /** Filename inside src/media/projectes/ — originals are never modified. */
  file: string;
  width: number;
  height: number;
  alt: Localized;
}

/** Editorial code excerpt for development / systems / data projects. */
export interface CodeBlock {
  language: string; // e.g. 'sql', 'bash', 'python' — shown as a label only
  content: string;
  caption?: Localized;
}

export interface CaseSection {
  /** Overview, Context, Challenge, Design approach, UX/UI process, Design system,
   *  Architecture, Infrastructure, Results… */
  title: Localized;
  body: Localized;
  images?: ProjectImage[];
  /** Diagrams (network, architecture, data flow) — SVG/PNG in src/media/projectes/. */
  diagrams?: ProjectImage[];
  code?: CodeBlock[];
}

/** Which discipline a project belongs to: design (UX/UI), development (DAM) or systems (ASIR). */
export type ProjectDiscipline = 'design' | 'development' | 'systems';

export interface Project {
  slug: string;
  title: string;
  discipline: ProjectDiscipline;
  category: Localized;
  type: Localized;
  /** Only shown once confirmed. */
  year: number | Pending;
  /** Short description. `draft: true` marks copy written from the visuals that needs Ona's review. */
  summary: Localized & { draft?: boolean };
  /** Main full-page design. `null` renders a marked placeholder. */
  cover: ProjectImage | Pending;
  /** Optional case-study sections — only rendered when provided. */
  sections?: CaseSection[];
  /** Extra screenshots / mockups (desktop & mobile). */
  gallery?: ProjectImage[];
  credits?: Localized;
  /** Third-party brand concept → shows a non-affiliation note. */
  brandConcept?: string;
}

export interface ExperienceItem {
  company: string;
  role: Localized;
  period: string;
  description?: Localized;
}

export interface EducationItem {
  title: Localized;
  specialization?: Localized;
  /** Short status label, e.g. in progress. */
  status?: Localized;
  institution?: string;
  period?: string;
}

export interface AwardItem {
  name: string;
  detail: Localized;
  year?: string;
  /** Information still to be confirmed (shown in development only). */
  toConfirm?: Localized;
}

export interface EventItem {
  name: string;
  full: Localized;
  place?: string;
}
