import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface GameValue { isOpen: boolean; open: () => void; close: () => void }
const GameContext = createContext<GameValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const value = useMemo(() => ({ isOpen, open: () => setOpen(true), close: () => setOpen(false) }), [isOpen]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>');
  return ctx;
}
