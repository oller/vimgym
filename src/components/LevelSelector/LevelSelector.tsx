import type { PropsWithChildren } from "react";
import { LEVELS } from "../../data/levels";
import { usePlayerDashboard } from "../../hooks/api";
import { useLevelId } from "../../hooks/useLevelId";
import { useScrollIntoView } from "../../hooks/useScrollIntoView";
import { getUserId } from "../../lib/analytics";
import type { PlayerDashboard } from "../../schemas";
import { useGameStore } from "../../store/useGameStore";
import { LevelSelectorContext } from "./LevelSelectorContext";
import { LevelSelectorItem } from "./LevelSelectorItem";

type LevelSelectorRootProps = {
  currentLevelId: number;
  onSelectLevel: (id: number) => void;
  dashboardData: PlayerDashboard;
};

export const LevelSelectorRoot = ({
  children,
  currentLevelId,
  onSelectLevel,
  dashboardData,
}: PropsWithChildren<LevelSelectorRootProps>) => {
  return (
    <LevelSelectorContext.Provider
      value={{ currentLevelId, onSelectLevel, dashboardData }}
    >
      <div className="w-full md:border-l font-roboto-mono border-gray-800 h-full flex flex-col min-h-0 pl-0">
        {children}
      </div>
    </LevelSelectorContext.Provider>
  );
};

export const LevelSelectorList = ({ children }: PropsWithChildren) => {
  return (
    <div className="space-y-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent md:pl-4">
      {children}
    </div>
  );
};

// --- Container (Legacy Support) ---

export const LevelSelector = () => {
  const currentLevel = useGameStore((state) => state.currentLevel);
  const [, setLevelId] = useLevelId();

  const userId = getUserId();
  const { data: dashboard = {} } = usePlayerDashboard(userId);

  const scrollRef = useScrollIntoView<HTMLDivElement>(currentLevel, {
    behavior: "smooth",
    block: "center",
  });

  return (
    <LevelSelectorRoot
      currentLevelId={currentLevel}
      dashboardData={dashboard}
      onSelectLevel={setLevelId}
    >
      <LevelSelectorList>
        {LEVELS.map((level) => {
          const levelData = dashboard[level.id];
          const isCurrentLevel = level.id === currentLevel;

          return (
            <LevelSelectorItem
              isCurrentLevel={isCurrentLevel}
              key={level.id}
              level={level}
              levelData={levelData}
              ref={isCurrentLevel ? scrollRef : null}
            >
              <LevelSelectorItem.Trigger onClick={() => setLevelId(level.id)} />
              <LevelSelectorItem.Stats />
            </LevelSelectorItem>
          );
        })}
      </LevelSelectorList>
    </LevelSelectorRoot>
  );
};
