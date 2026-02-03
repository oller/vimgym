import { createContext, useContext } from "react";
import type { Level } from "../../data/levels";
import type { PlayerDashboard } from "../../schemas";

type LevelSelectorItemContextValue = {
  level: Level;
  levelData: PlayerDashboard[string] | undefined;
  isCurrentLevel: boolean;
  isStatsOpen: boolean;
  setIsStatsOpen: (isOpen: boolean) => void;
};

export const LevelSelectorItemContext = createContext<
  LevelSelectorItemContextValue | undefined
>(undefined);

export const useLevelSelectorItem = () => {
  const context = useContext(LevelSelectorItemContext);
  if (!context) {
    throw new Error(
      "useLevelSelectorItem must be used within a LevelSelector.Item",
    );
  }
  return context;
};
