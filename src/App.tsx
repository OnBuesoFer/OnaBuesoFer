import { useEffect } from 'react';
import { RouterProvider, useRouter } from './lib/router.tsx';
import { LangProvider, useT } from './lib/i18n.tsx';
import { GameProvider } from './lib/game.tsx';
import { headFor } from './lib/head.ts';
import { useReveal } from './hooks/useReveal.ts';
import { Header } from './components/layout/Header.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { Preloader } from './components/layout/Preloader.tsx';
import { GameDialog } from './components/game/GameDialog.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { ProjectPage } from './pages/ProjectPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';
import { LegalPage } from './pages/LegalPage.tsx';

export function App({ initialPath }: { initialPath: string }) {
  return (
    <RouterProvider initialPath={initialPath}>
      <Shell />
    </RouterProvider>
  );
}

function Shell() {
  const { route } = useRouter();
  return (
    <LangProvider lang={route.lang}>
      <GameProvider>
        <Frame />
      </GameProvider>
    </LangProvider>
  );
}

function Frame() {
  const { route } = useRouter();
  const t = useT();
  useReveal(route);

  // Keep <head> in sync during client-side navigation (pre-rendered HTML already has it).
  useEffect(() => {
    const h = headFor(route);
    document.title = h.title;
    document.documentElement.lang = h.lang;
    document.querySelector('meta[name="description"]')?.setAttribute('content', h.description);
  }, [route]);

  const page =
    route.name === 'home' ? <HomePage /> :
    route.name === 'project' ? <ProjectPage key={route.slug} slug={route.slug} /> :
    route.name === 'legal' ? <LegalPage key={route.slug} slug={route.slug} /> :
    <NotFoundPage />;

  return (
    <>
      <span id="top" />
      <a className="skip-link" href="#main">{t.a11y.skip}</a>
      <Preloader />
      <Header />
      <main id="main" tabIndex={-1}>{page}</main>
      <Footer />
      <GameDialog />
    </>
  );
}
