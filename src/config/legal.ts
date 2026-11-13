import type { Localized } from '../types/content.ts';
import type { LegalSlug } from '../lib/router.tsx';

/**
 * Legal pages. Content states only verifiable facts about how THIS site
 * works (no forms, no analytics, no cookies). Personal/legal details that
 * only Ona can provide are `pending` and render as PENDING markers.
 * ⚠ Not legal advice — review before publishing.
 */
export interface LegalBlock {
  heading: Localized;
  body: Localized[];
  /** Fields still to be supplied by the site owner. */
  pending?: Localized[];
}
export interface LegalDoc {
  title: Localized;
  intro: Localized;
  updated: string; // ISO date
  blocks: LegalBlock[];
}

export const legal: Record<LegalSlug, LegalDoc> = {
  privacy: {
    title: { en: 'Privacy Policy', es: 'Política de privacidad' },
    intro: {
      en: 'This portfolio does not collect personal data: there are no forms, accounts, analytics or tracking.',
      es: 'Este portfolio no recoge datos personales: no hay formularios, cuentas, analítica ni seguimiento.',
    },
    updated: '2026-11-13',
    blocks: [
      {
        heading: { en: 'Data controller', es: 'Responsable' },
        body: [{ en: 'Ona — GEMINISOBF.DEV.', es: 'Ona — GEMINISOBF.DEV.' }],
        pending: [{ en: 'Contact email', es: 'Correo de contacto' }],
      },
      {
        heading: { en: 'What is collected', es: 'Qué datos se recogen' },
        body: [
          {
            en: 'None by this website. It has no contact form, newsletter, user accounts, analytics or advertising.',
            es: 'Ninguno por parte de esta web. No tiene formulario de contacto, newsletter, cuentas de usuario, analítica ni publicidad.',
          },
          {
            en: 'If you write by email, your message is handled only to reply to you.',
            es: 'Si escribes por correo, tu mensaje se usa únicamente para responderte.',
          },
        ],
      },
      {
        heading: { en: 'Cookies and local storage', es: 'Cookies y almacenamiento local' },
        body: [
          { en: 'This website does not set cookies.', es: 'Esta web no instala cookies.' },
          {
            en: 'Your browser stores three technical preferences on your device only: whether the intro has already been shown (session), and the mini-game best score and sound preference. They are never sent anywhere and can be cleared from your browser settings.',
            es: 'Tu navegador guarda tres preferencias técnicas solo en tu dispositivo: si ya se ha mostrado la intro (sesión), y el récord y la preferencia de sonido del minijuego. Nunca se envían a ningún sitio y puedes borrarlas desde los ajustes del navegador.',
          },
        ],
      },
      {
        heading: { en: 'Hosting', es: 'Alojamiento' },
        body: [
          {
            en: 'The hosting provider may process technical data such as IP addresses in server logs, as needed to deliver the website.',
            es: 'El proveedor de alojamiento puede tratar datos técnicos como direcciones IP en sus registros de servidor, en la medida necesaria para servir la web.',
          },
        ],
        pending: [{ en: 'Hosting provider name', es: 'Nombre del proveedor de alojamiento' }],
      },
      {
        heading: { en: 'External links', es: 'Enlaces externos' },
        body: [
          {
            en: 'Links to platforms such as LinkedIn or GitHub are governed by their own privacy policies.',
            es: 'Los enlaces a plataformas como LinkedIn o GitHub se rigen por sus propias políticas de privacidad.',
          },
        ],
      },
    ],
  },
  'legal-notice': {
    title: { en: 'Legal Notice', es: 'Aviso legal' },
    intro: {
      en: 'Identification of the owner of this website and terms of use.',
      es: 'Identificación de la titular de esta web y condiciones de uso.',
    },
    updated: '2026-11-13',
    blocks: [
      {
        heading: { en: 'Owner', es: 'Titular' },
        body: [{ en: 'Ona — GEMINISOBF.DEV. Personal portfolio website.', es: 'Ona — GEMINISOBF.DEV. Web de portfolio personal.' }],
        pending: [
          { en: 'Full legal name', es: 'Nombre completo' },
          { en: 'Tax ID (if required)', es: 'NIF (si procede)' },
          { en: 'Contact email', es: 'Correo de contacto' },
        ],
      },
      {
        heading: { en: 'Intellectual property', es: 'Propiedad intelectual' },
        body: [
          {
            en: 'Designs, texts and code on this website are the work of Ona unless stated otherwise and may not be reproduced without permission.',
            es: 'Los diseños, textos y código de esta web son obra de Ona salvo indicación contraria y no pueden reproducirse sin permiso.',
          },
          {
            en: 'Projects based on existing brands are academic concepts. Their trademarks and photography belong to their respective owners; no affiliation or endorsement is implied.',
            es: 'Los proyectos basados en marcas existentes son conceptos académicos. Sus marcas y fotografías pertenecen a sus respectivos propietarios; no implican afiliación ni respaldo.',
          },
        ],
      },
      {
        heading: { en: 'Liability', es: 'Responsabilidad' },
        body: [
          {
            en: 'The owner is not responsible for the content of external websites linked from this portfolio.',
            es: 'La titular no se responsabiliza del contenido de las webs externas enlazadas desde este portfolio.',
          },
        ],
      },
    ],
  },
};
