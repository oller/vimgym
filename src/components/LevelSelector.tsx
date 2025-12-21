import { useNavigate } from "@tanstack/react-router";
import { LEVELS } from "../data/levels";
import { useGameStore } from "../store/useGameStore";
import { cn } from "../utils/cn";

export const LevelSelector = () => {
  const { currentLevel, highScores } = useGameStore();
  const navigate = useNavigate({ from: "/" });

  return (
    <div className="p-4 bg-tokyo-night-storm rounded-lg border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Levels
      </h3>
      <div className="space-y-2">
        {LEVELS.map((level) => {
          const score = highScores[level.id];
          const isCurrent = level.id === currentLevel;
          const isPerfect = score !== undefined && score <= level.perfectScore;

          return (
            <button
              type="button"
              key={level.id}
              onClick={() => navigate({ search: { levelId: level.id } })}
              className={cn(
                "w-full cursor-pointer text-left p-3 rounded transition-all",
                isCurrent && score === undefined && "bg-gray-700 text-white",
                score !== undefined && "bg-green-600 text-gray-200",
                !isCurrent && score === undefined && "text-gray-400",
                isPerfect && "bg-gold-gradient text-slate-800 animate-shimmer",
              )}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1 space-y-1">
                  <div className="font-semibold text-sm">Level {level.id}</div>
                  <div className="text-xs ">{level.name}</div>
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
