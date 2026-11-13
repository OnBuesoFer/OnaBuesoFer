import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App.tsx';
import './css/main.css';

const container = document.getElementById('root');
if (!container) throw new Error('#root not found');

const app = (
  <StrictMode>
    <App initialPath={window.location.pathname} />
  </StrictMode>
);

// Pre-rendered pages are hydrated; the dev server renders from scratch.
if (container.firstElementChild) hydrateRoot(container, app);
else createRoot(container).render(app);
