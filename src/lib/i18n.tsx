import { createContext, useContext, type ReactNode } from 'react';
import { dictionaries, type Dict } from '../config/i18n.ts';
import type { Lang, Localized } from '../types/content.ts';

const LangContext = createContext<Lang>('en');

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export const useLang = (): Lang => useContext(LangContext);
export const useT = (): Dict => dictionaries[useContext(LangContext)];

/** Pick the current language from a Localized value. */
export function useL(): (v: Localized) => string {
  const lang = useContext(LangContext);
  return (v) => v[lang];
}
