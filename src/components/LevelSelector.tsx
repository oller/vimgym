import { useNavigate } from "@tanstack/react-router";
import { LEVELS } from "../data/levels";
import { useGameStore } from "../store/useGameStore";
import { cn } from "../utils/cn";

export const LevelSelector = () => {
  const { currentLevel, highScores } = useGameStore();
  const navigate = useNavigate({ from: "/" });

  return (
    <div className="md:pl-4 md:border-l border-gray-700">
      <div className="space-y-2">
        {LEVELS.map((level) => {
          const score = highScores[level.id];
          const isCurrentLevel = level.id === currentLevel;
          const isPerfectScore =
            score !== undefined && score <= level.perfectScore;
          const isUnplayedLevel = score === undefined;

          return (
            <button
              type="button"
              key={level.id}
              onClick={() => navigate({ search: { levelId: level.id } })}
              className={cn(
                "w-full cursor-pointer text-left p-3 rounded transition-all ",
                isCurrentLevel &&
                  isUnplayedLevel &&
                  "bg-tokyo-night-storm text-white",
                !isUnplayedLevel && "bg-green-600 text-gray-200",
                !isCurrentLevel &&
                  isUnplayedLevel &&
                  "text-gray-400 hover:bg-tokyo-night-storm/30",
                isPerfectScore &&
                  "bg-gold-gradient text-slate-800 animate-shimmer",
              )}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1 space-y-1">
                  <div className="font-semibold text-xs">Level {level.id}</div>
                  <div className="text-xs">{level.name}</div>
                </div>
                {score !== undefined && (
                  <div
                    className={cn(
                      "text-xs font-mono px-2 py-1 rounded bg-black/20 text-white",
                    )}
                  >
                    {score} keys
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
