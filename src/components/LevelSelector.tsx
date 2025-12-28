import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { LEVELS } from "../data/levels";
import { useScrollIntoView } from "../hooks/useScrollIntoView";
import { useGameStore } from "../store/useGameStore";
import { cn } from "../utils/cn";

export const LevelSelector = () => {
  const { currentLevel, highScores } = useGameStore();
  const navigate = useNavigate({ from: "/" });

  const scrollRef = useScrollIntoView<HTMLDivElement>(currentLevel, {
    behavior: "smooth",
    block: "center",
  });

  return (
    <div className="md:border-l border-gray-800 h-full flex flex-col min-h-0 pl-0">
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
              key={level.id}
              ref={isCurrentLevel ? scrollRef : null}
              className="relative w-full"
            >
              {isCurrentLevel && (
                <motion.div
                  layoutId="active-level-indicator"
                  className="absolute left-[-1rem] top-0 bottom-0 w-1 bg-slate-500 rounded-r-full"
                />
              )}
              <button
                type="button"
                onClick={() => navigate({ search: { levelId: level.id } })}
                style={
                  {
                    "--shimmer-delay": `-${delay}s`,
                  } as React.CSSProperties
                }
                className={cn(
                  "relative w-full cursor-pointer text-left p-3 rounded transition-all ", // Added relative
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
                    <div className="font-semibold text-xs">
                      Level {level.id}
                    </div>
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
            </div>
          );
        })}
      </div>
    </div>
  );
};
