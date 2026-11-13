# GEMINISOBF.DEV — Ona Bueso · Portfolio

**Photography · Digital design · A technical mind behind both.**

Bilingual (EN / ES) portfolio of Ona Bueso: photography and digital design as the main practice,
with a technical background in multiplatform application development (DAM).

🔗 **Live site:** https://onbuesofer.github.io/OnaBuesoFer/

---

## What's inside

**Home**
- **Hero:** a static system blueprint (application, load balancer, APIs, an SQL table mapping, firewall,
  switch and server rack) drawn on a 24 px grid. No motion and no scroll or pointer effects.
- **Selected Work:** an editorial index of five web design projects (Porsche 911, MWC, QUANTEX Labs, Audi,
  Nadie Dice Nada). Each one previews its full-page design in a scrolling frame and has its own case-study page.
- **About**, **Disciplines** (Design · DAM · ASIR, each with a truthful status label), **Experience**,
  **Education**, **Awards & Events** and **Contact**.
- **Paper → Screen:** the page starts on a light editorial surface and turns into a deep-green technical
  environment as you scroll.

**Projects & Services** (`/projects-services/`)
- **Services:** photography and digital design, with real project photography.
- **Additional work:** an index by discipline that grows as new work is published.
- **Status:** a "More coming soon" panel with a real count of published categories.
- **Contact:** social media first.

**Also:** Privacy Policy and Legal Notice pages, a 404 page, and **Designer Survival**, an optional
arcade mini-game behind **PLAY?** (keyboard + touch, sound with mute, local best score).

## Stack

| | |
|---|---|
| UI | React 19 + TypeScript (strict) |
| Build | Vite 8: client build + SSR build → every route pre-rendered to static HTML |
| Styling | Modern CSS with design tokens (custom properties) and a shared 12-column grid |
| Graphics | Canvas 2D (hero blueprint, game), SVG, CSS transitions, View Transitions |
| Images | `sharp` generates responsive AVIF/WebP from the originals at build time |

No routing, animation or state libraries. The router is about 110 lines of code, and the canvas
renderers are framework-agnostic TypeScript classes. The hero blueprint and the game load as separate chunks.

## Getting started

Requires **Node 22.18+** (Node 24 recommended — see `.nvmrc`).

```bash
npm install
npm run dev        # also generates the responsive images
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Images → typecheck → client build → SSR build → pre-render to `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run typecheck` | TypeScript only |
| `npm run images` | Regenerates `public/generated/` (runs automatically) |
| `npm run og` | Regenerates the share image, PNG favicons and manifest |

## Editing content (no component changes needed)

| What | Where |
|---|---|
| Social links, SEO, site settings | `src/config/site.ts` |
| Selected Work projects | `src/config/projects.ts` |
| Services, service photos, additional work | `src/config/services.ts` |
| Experience, education, awards, events | `src/config/profile.ts` |
| Disciplines and their status | `src/config/disciplines.ts` |
| Privacy Policy / Legal Notice | `src/config/legal.ts` |
| All interface copy (EN + ES) | `src/config/i18n.ts` |
| Design tokens (colour, type, spacing) | `src/css/tokens.css` |
| Logo & favicon | `src/media/geminisobfFavicon.svg` |

Missing values (e.g. a social profile URL set to `null`) render as visible **PENDING** markers and are
never turned into fake links.

### Add an image to a service

Put the file in `src/media/projectes/` and reference it in `src/config/services.ts`:

```ts
{ image: { file: 'pg/MyPhoto.jpg', width: 4000, height: 5000, alt: { en: '…', es: '…' } },
  ratio: 'auto',                       // 'auto' keeps the photo's own proportions
  caption: { en: '…', es: '…' } }
```

### Add a project to Selected Work

Append an entry to `src/config/projects.ts` (title, category, type, summary and `cover` image).
The responsive images, case-study page, previous/next links and sitemap entry are generated automatically.

## Project structure

```
index.html                   HTML shell (head tags injected per route at build time)
public/                      favicon, share image, manifest (+ generated/, git-ignored)
scripts/
  optimize-images.ts         originals → AVIF/WebP variants (published images only)
  generate-og.ts             share image + favicons from the brand fonts and logo
  prerender.ts               static HTML for every route, sitemap.xml, robots.txt, 404.html
src/
  config/                    all content
  pages/                     Home, Project (case study), Projects & Services, Legal, 404
  components/                layout · sections · work · ui · game
  css/                       tokens, fonts, base + one stylesheet per area
  js/blueprint/              static hero blueprint (Canvas 2D)
  js/game/                   Designer Survival (Canvas 2D + Web Audio)
  lib/  hooks/  types/       router, i18n, SEO, media helpers · hooks · content model
  media/                     original assets: projectes/, tipografia/, logo
```

## Deployment

The site is fully static (`dist/`) and is published with **GitHub Pages**:

1. Settings → Pages → Source: **GitHub Actions**.
2. Actions → **Deploy to GitHub Pages** → **Run workflow**. The workflow is manual, so pushing to
   `main` does **not** publish on its own. It builds with `BASE_PATH=/<repo>/` automatically.
3. Optional: add the repository variable `SITE_URL` (`https://onbuesofer.github.io`) so canonical URLs,
   Open Graph tags and `sitemap.xml` use absolute URLs.

The project can also be deployed to Vercel: `vercel.json` is included. Set `BASE_PATH=/` there.

## Privacy

- Private, unpublished work is git-ignored and never processed or published.
- Projects based on existing brands (Porsche, Audi, MWC) show a non-affiliation note.
- No analytics, no cookies, no contact form. Only the game's best score and sound preference are stored
  locally in the browser.

## Accessibility & performance

- Semantic landmarks, a skip link, one `h1` per page and visible focus states.
- Colour contrast checked: green is used as text only on dark surfaces.
- `prefers-reduced-motion` is respected; the hero is always static.
- Images have intrinsic sizes (no layout shift) and are served as AVIF/WebP with lazy loading.

## Fonts

- **Neue Montreal** (headings), served as supplied. Pangram Pangram's free licence is for personal use;
  confirm a web-embedding licence for commercial use.
- **DM Sans** (body / UI), under the SIL Open Font License.

---

© Ona Bueso · GEMINISOBF.DEV
