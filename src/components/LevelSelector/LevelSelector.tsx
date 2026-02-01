import { useNavigate } from "@tanstack/react-router";
import { LEVELS } from "../../data/levels";
import { usePlayerDashboard } from "../../hooks/api";
import { useScrollIntoView } from "../../hooks/useScrollIntoView";
import { getUserId } from "../../lib/analytics";
import { useGameStore } from "../../store/useGameStore";
import { LevelSelectorItem } from "./LevelSelectorItem";

export const LevelSelector = () => {
  const currentLevel = useGameStore((state) => state.currentLevel);
  const navigate = useNavigate({ from: "/" });

  const userId = getUserId();
  const { data: dashboard = {} } = usePlayerDashboard(userId);

  const scrollRef = useScrollIntoView<HTMLDivElement>(currentLevel, {
    behavior: "smooth",
    block: "center",
  });

  return (
    <div className="w-full md:border-l font-roboto-mono border-gray-800 h-full flex flex-col min-h-0 pl-0">
      <div className="space-y-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent md:pl-4">
        {LEVELS.map((level) => {
          const levelData = dashboard[level.id];
          const isCurrentLevel = level.id === currentLevel;

          return (
            <LevelSelectorItem
              isCurrentLevel={isCurrentLevel}
              key={level.id}
              level={level}
              levelData={levelData}
              onClick={() =>
                navigate({ search: { levelId: level.id }, replace: true })
              }
              scrollRef={scrollRef}
            />
          );
        })}
      </div>
    </div>
  );
};
