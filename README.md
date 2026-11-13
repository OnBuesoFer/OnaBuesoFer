# ONA. — Portfolio

**UX/UI Designer & Creative Technologist** · *Art thinking. Technical mind. Digital experiences.*

A bilingual (EN / ES) portfolio built around one idea: **from visual expression to digital experiences**.
The site starts as an editorial, paper-like surface (art) and turns into a deep-green technical
environment (technology) as you scroll.

- **System blueprint** (hero): a static DAM/ASIR architecture drawing — app, load balancer, APIs, SQL table mapping, firewall, switch, server rack — with a fixed code-matrix block. No motion, no scroll or pointer effects.
- **Paper → Screen bridge**: a stepped pixel field that fills as the page crosses from art to technology.
- **Selected Work**: an editorial index; each project previews its full page design inside a scrolling frame.
- **Designer Survival**: an optional arcade mini-game behind **PLAY?** (60-second "iteration", keyboard + touch, sound with mute, local best score).

---

## Stack

| | |
|---|---|
| UI | React 19 + TypeScript (strict) |
| Build | Vite 8 — client build + SSR build → static pre-rendering of every route |
| Styling | Modern CSS with design tokens (custom properties), no CSS framework |
| Interaction | Canvas 2D (hero blueprint, game), SVG (diagram, icons), CSS animations, View Transitions |
| Images | `sharp` → responsive AVIF/WebP generated from the originals at build time |

No routing, animation or state libraries: the router is ~110 lines, scroll effects write a single CSS
variable, and the canvas engines are framework-agnostic TypeScript classes. GSAP and Framer Motion
were evaluated and not needed. Main bundle ≈ 84 kB gzip (mostly React); the hero blueprint (~3 kB)
and the game (~6 kB) are separate chunks loaded on demand.

## Getting started

Requires **Node 22.18+** (Node 24 recommended — see `.nvmrc`). TypeScript build scripts run natively in Node.

```bash
npm install
npm run dev        # http://localhost:5173 — also generates responsive images
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Images → typecheck → client build → SSR build → pre-render to `dist/` |
| `npm run preview` | Serves `dist/` locally (http://localhost:4173) |
| `npm run typecheck` | TypeScript only |
| `npm run images` | Regenerates `public/generated/` (runs automatically) |
| `npm run og` | Regenerates `og-image.png`, PNG favicon fallbacks and manifest from the brand SVG + fonts |

## Editing content — no component changes needed

| What | Where |
|---|---|
| Email, LinkedIn, GitHub, location, availability, SEO | `src/config/site.ts` |
| Projects (add / edit / reorder) | `src/config/projects.ts` |
| Experience, education, awards, events | `src/config/profile.ts` |
| Disciplines (Art & UX/UI · DAM · ASIR) and their truthful status | `src/config/disciplines.ts` |
| Privacy Policy / Legal Notice text | `src/config/legal.ts` |
| All interface copy (EN + ES) | `src/config/i18n.ts` |
| Design tokens (colour, type, spacing, motion) | `src/css/tokens.css` |
| Logo & favicon | `src/media/geminisobfFavicon.svg` (used as-is; replace the file to rebrand, then `npm run og`) |

Values set to `null` render as visible **PENDING** markers, never as fake links.

### Add a project

1. Put the image in `src/media/projectes/`.
2. Append an entry to `src/config/projects.ts`:

```ts
{
  slug: 'my-project',
  title: 'My Project',
  category: { en: 'Web Design', es: 'Diseño web' },
  type: { en: 'Personal Project', es: 'Proyecto personal' },
  discipline: 'development',        // 'design' | 'development' (DAM) | 'systems' (ASIR)
  year: 2026,                       // or null until confirmed
  summary: { en: '…', es: '…' },
  cover: { file: 'My_Project.png', width: 1920, height: 4000, alt: { en: '…', es: '…' } },
  // optional: sections (with images, diagrams, code excerpts), gallery, credits, brandConcept
},
```

3. `npm run dev`. Responsive images, the case-study page (`/work/my-project/`), previous/next links
   and the sitemap entry are all generated automatically.

## Project structure

```
index.html                 HTML shell (head tags are injected per route at build time)
public/                    favicon, og-image, manifest (+ generated/ — git-ignored)
scripts/
  optimize-images.ts       originals → AVIF/WebP variants (published projects only)
  generate-og.ts           brand OG image + favicons from the real fonts
  prerender.ts             static HTML for every route, sitemap.xml, robots.txt, 404.html
src/
  config/                  ← all content (site, projects, profile, i18n)
  types/                   content model
  css/                     tokens, fonts, base + one stylesheet per area
  js/blueprint/blueprint.ts  static hero system blueprint (Canvas 2D, renders on resize only)
  js/game/engine.ts        Designer Survival (Canvas 2D + Web Audio)
  components/              layout · sections · work · ui · game
  pages/                   Home, Project (case study), 404
  hooks/  lib/             media queries, reveal, scroll progress · router, i18n, head/SEO, media helpers
  media/                   original assets (unchanged): moodboard/, projectes/, tipografia/
```

## Fonts

- **Neue Montreal** (headings): served from `src/media/tipografia/NEUE MONTREAL/` as supplied (OTF, unmodified).
  ⚠ Pangram Pangram's free licence is personal-use only — **confirm a web-embedding licence before publishing**.
- **DM Sans** (UI/body): weights 400–500 + italic come from the official OFL variable font, added in
  `src/media/tipografia/DM SANS/OFL-regular-medium/` (with `OFL.txt` and Latin-subset WOFF2 copies);
  Light 300 and Bold 700 use the supplied files.
- Duplicate font files (`… 2.otf`, `… 3.ttf`) are left untouched; only one copy of each is referenced.

## Deployment

The build is fully static (`dist/`). Set `SITE_URL` before a production build so canonical URLs,
Open Graph tags (LinkedIn needs absolute image URLs) and `sitemap.xml` are correct — see `.env.example`.

### Vercel (recommended)

1. Import the GitHub repository in Vercel. `vercel.json` already sets the build command and output.
2. Add the environment variable `SITE_URL` (e.g. `https://your-domain.com`).
3. Deploy. Preview deployments are created for every branch.

### GitHub Pages

1. Settings → Pages → Source: **GitHub Actions**.
2. Settings → Secrets and variables → Actions → Variables: `SITE_URL` = `https://<user>.github.io`.
3. Actions → **Deploy to GitHub Pages** → Run workflow (manual only, nothing deploys on push).
   The workflow builds with `BASE_PATH=/<repo>/` automatically.

## Privacy & assets

- `src/media/projectes/Projecte_Morph.png` is **private**: it is git-ignored and never processed or published.
- Brand concept projects (Porsche, Audi, MWC, Formula One) show a non-affiliation note.
- No analytics, cookies or contact form. Only the game's best score and mute preference use `localStorage`.

## Accessibility & performance

- Semantic landmarks, skip link, one `h1` per page, visible focus states (ink on paper, green on deep).
- Green is used as text only on dark surfaces (8.6:1); on paper it is a fill behind black text (11.6:1).
- `prefers-reduced-motion`: no intro, no pans, instant transitions (the hero blueprint is always static).
- Canvas loops pause off-screen and in background tabs; DPR capped at 2.
- Images have intrinsic sizes (no layout shift), AVIF/WebP, lazy loading; fonts use `font-display: swap`
  with metric-adjusted fallbacks.
# portfolio
# OnaBuesoFer
