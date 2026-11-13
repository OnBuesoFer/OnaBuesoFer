import type { Localized } from '../types/content.ts';

/**
 * ─────────────────────────────────────────────────────────────────────
 *  DISCIPLINES — Art & UX/UI · DAM · ASIR.
 *  `status` must stay truthful. Use:
 *    background · studying · completed · interest
 *  Areas describe the field / direction, not claimed expertise.
 *  Never add languages, tools or certifications that are not verified.
 * ─────────────────────────────────────────────────────────────────────
 */
export type DisciplineStatus = 'background' | 'studying' | 'completed' | 'interest';

export interface Discipline {
  id: string;
  code: string; // short technical tag
  name: Localized;
  full: Localized;
  status: DisciplineStatus[];
  areas: Localized[];
}

export const disciplines: Discipline[] = [
  {
    id: 'design',
    code: 'ART / UX',
    name: { en: 'Art & Design', es: 'Arte y diseño' },
    full: { en: 'Graphic design, UX/UI and digital experiences', es: 'Diseño gráfico, UX/UI y experiencias digitales' },
    status: ['background'], // Higher Vocational Training in Graphic & Interactive Art & Design
    areas: [
      { en: 'Graphic design & visual communication', es: 'Diseño gráfico y comunicación visual' },
      { en: 'Illustration & photography', es: 'Ilustración y fotografía' },
      { en: 'UX/UI & interface design', es: 'UX/UI y diseño de interfaces' },
      { en: 'Web design & digital experiences', es: 'Diseño web y experiencias digitales' },
    ],
  },
  {
    id: 'dam',
    code: 'DAM',
    name: { en: 'Application Development', es: 'Desarrollo de aplicaciones' },
    full: { en: 'Multiplatform Application Development', es: 'Desarrollo de Aplicaciones Multiplataforma' },
    status: ['studying'], // Education entry 02 — "Doing"
    areas: [
      { en: 'Programming & object-oriented design', es: 'Programación y orientación a objetos' },
      { en: 'Frontend & backend development', es: 'Desarrollo frontend y backend' },
      { en: 'Web & mobile applications', es: 'Aplicaciones web y móviles' },
      { en: 'Databases & SQL', es: 'Bases de datos y SQL' },
      { en: 'APIs & software integration', es: 'APIs e integración de software' },
      { en: 'Software architecture & workflows', es: 'Arquitectura de software y flujos de trabajo' },
    ],
  },
  {
    id: 'asir',
    code: 'ASIR',
    name: { en: 'Systems & Networks', es: 'Sistemas y redes' },
    full: { en: 'Networked Computer Systems Administration', es: 'Administración de Sistemas Informáticos en Red' },
    status: ['interest'], // update to 'studying' / 'completed' only if confirmed
    areas: [
      { en: 'Linux & Windows server administration', es: 'Administración de servidores Linux y Windows' },
      { en: 'Networks & infrastructure', es: 'Redes e infraestructura' },
      { en: 'Virtualization & cloud', es: 'Virtualización y cloud' },
      { en: 'Cybersecurity & system security', es: 'Ciberseguridad y seguridad de sistemas' },
      { en: 'Monitoring, automation & scripting', es: 'Monitorización, automatización y scripting' },
      { en: 'Deployment, maintenance & troubleshooting', es: 'Despliegue, mantenimiento y resolución de incidencias' },
    ],
  },
];
