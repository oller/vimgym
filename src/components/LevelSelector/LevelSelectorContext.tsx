import { createContext, use } from "react";
import type { PlayerDashboard } from "../../schemas";

type LevelSelectorContextValue = {
  currentLevel: string;
  dashboard: Record<string, PlayerDashboard[string]>;
  onSelect: (id: string) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
};

export const LevelSelectorContext =
  createContext<LevelSelectorContextValue | null>(null);

export const useLevelSelectorContext = (): LevelSelectorContextValue => {
  const ctx = use(LevelSelectorContext);
  if (!ctx) {
    throw new Error(
      "useLevelSelectorContext must be used within LevelSelector",
    );
  }
  return ctx;
};
