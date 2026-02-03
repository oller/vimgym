import { createContext, useContext } from "react";
import type { PlayerDashboard } from "../../schemas";

type LevelSelectorContextValue = {
  currentLevelId: number;
  onSelectLevel: (id: number) => void;
  dashboardData: PlayerDashboard;
};

export const LevelSelectorContext = createContext<
  LevelSelectorContextValue | undefined
>(undefined);

export const useLevelSelector = () => {
  const context = useContext(LevelSelectorContext);
  if (!context) {
    throw new Error(
      "useLevelSelector must be used within a LevelSelector.Root",
    );
  }
  return context;
};
