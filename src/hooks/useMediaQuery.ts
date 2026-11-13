import { useSyncExternalStore } from 'react';

/** Subscribes to a media query. Returns `fallback` during pre-rendering. */
export function useMediaQuery(query: string, fallback = false): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', cb);
      return () => mql.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
export const useCoarsePointer = () => useMediaQuery('(hover: none), (pointer: coarse)');
