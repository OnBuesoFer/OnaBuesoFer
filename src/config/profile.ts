import type { AwardItem, EducationItem, EventItem, ExperienceItem } from '../types/content.ts';

/** Professional experience — only confirmed information. */
export const experience: ExperienceItem[] = [
  {
    company: 'Punta Alta Comunicació',
    role: { en: 'Graphic Designer Intern', es: 'Diseñadora gráfica en prácticas' },
    period: '2023–2024',
  },
  {
    company: 'Identify Travel',
    role: { en: 'Graphic Designer / UX/UI Designer', es: 'Diseñadora gráfica / Diseñadora UX/UI' },
    period: '2023–2024',
  },
];

/** Education — institutions and dates intentionally omitted until confirmed. */
export const education: EducationItem[] = [
  {
    title: {
      en: 'Higher Vocational Training in Graphic and Interactive Art & Design',
      es: 'Ciclo Formativo de Grado Superior en Artes Plásticas y Diseño Gráfico Interactivo',
    },
  },
  {
    title: {
      en: 'Higher Vocational Training in Multiplatform Application Development',
      es: 'Ciclo Formativo de Grado Superior en Desarrollo de Aplicaciones Multiplataforma',
    },
    status: { en: 'Doing', es: 'En curso' },
  },
  {
    title: {
      en: 'Certificate in Big Data and Artificial Intelligence Analysis',
      es: 'Certificado en Análisis de Big Data e Inteligencia Artificial',
    },
  },
];

export const awards: AwardItem[] = [
  {
    name: 'Jocs Florals',
    detail: {
      en: 'Award in Photography — secondary education',
      es: 'Premio de Fotografía — educación secundaria',
    },
  },
  {
    name: 'Escola Llotja',
    detail: { en: 'Recognition in Illustration', es: 'Reconocimiento en Ilustración' },
    toConfirm: { en: 'Exact name of the recognition', es: 'Nombre exacto del reconocimiento' },
  },
];

export const events: EventItem[] = [
  { name: '4YFN 2026', full: { en: 'Four Years From Now', es: 'Four Years From Now' }, place: 'Barcelona' },
  { name: 'MWC 2026', full: { en: 'Mobile World Congress', es: 'Mobile World Congress' }, place: 'Barcelona' },
];
