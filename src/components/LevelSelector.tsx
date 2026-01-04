import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { LEVELS } from "../data/levels";
import { useScrollIntoView } from "../hooks/useScrollIntoView";
import { useGameStore } from "../store/useGameStore";
import { cn } from "../utils/cn";

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
          const isPerfectScore =
            score !== undefined && score <= level.perfectScore;
          const isUnplayedLevel = score === undefined;
          // 6 is the animation cycle duration
          // % 6 ensures we always have a delay between 0 and 6
          // level.id * 0.7 is for a pseudo-random delay without bringing in Math.random()
          const delay = (level.id * 0.7) % 6;

          return (
            <div
              className="relative w-full"
              key={level.id}
              ref={isCurrentLevel ? scrollRef : null}
            >
              {isCurrentLevel && (
                <motion.div
                  className="absolute -left-4 top-0 bottom-0 w-1 bg-slate-500 rounded-r-full"
                  layoutId="active-level-indicator"
                />
              )}
              <button
                className={cn(
                  "w-full cursor-pointer text-left p-3 transition-colors",
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
                onClick={() => navigate({ search: { levelId: level.id } })}
                style={
                  {
                    "--shimmer-delay": `-${delay}s`,
                  } as React.CSSProperties
                }
                type="button"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 space-y-1">
                    <div className="font-semibold text-xs">
                      Level {level.id}
                    </div>
                    <div className="text-xs">{level.name}</div>
                  </div>
                  {score !== undefined && (
                    <div
                      className={cn(
                        "text-xs font-roboto-mono px-2 py-1 rounded bg-black/30 text-white",
                      )}
                    >
                      {score}
                    </div>
                  )}
                </div>
              </button>
            </div>
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
          Reset all progress
        </button>
      </div>
    </div>
  );
};
