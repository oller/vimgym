import { useNavigate } from "@tanstack/react-router";
import { LEVELS } from "../../data/levels";
import { useScrollIntoView } from "../../hooks/useScrollIntoView";
import { useGameStore } from "../../store/useGameStore";
import { LevelSelectorItem } from "./LevelSelectorItem";

export const LevelSelector = () => {
  const { currentLevel, highScores, clearScores } = useGameStore();
  const navigate = useNavigate({ from: "/" });

  const scrollRef = useScrollIntoView<HTMLDivElement>(currentLevel, {
    behavior: "smooth",
    block: "center",
  });

  return (
    <div className="w-full md:border-l font-roboto-mono border-gray-800 h-full flex flex-col min-h-0 pl-0">
      <div className="space-y-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent md:pl-4">
        {LEVELS.map((level) => {
          const score = highScores[level.id];
          const isCurrentLevel = level.id === currentLevel;

          return (
            <LevelSelectorItem
              isCurrentLevel={isCurrentLevel}
              key={level.id}
              level={level}
              onClick={() => navigate({ search: { levelId: level.id } })}
              score={score}
              scrollRef={scrollRef}
            />
          );
        })}
      </div>
      <div className="md:pl-4 pt-4 mt-auto">
        <button
          className="w-full cursor-pointer text-xs text-tokyo-night-pink bg-tokyo-night-pink/10 hover:bg-tokyo-night-pink/15 active:bg-tokyo-night-pink/25 p-2 text-center transition-colors font-roboto-mono uppercase tracking-wider"
          onClick={() => {
            if (window.confirm("Are you sure you want to clear all scores?")) {
              clearScores();
            }
          }}
          type="button"
        >
          Reset all scores
        </button>
      </div>
    </div>
  );
};
