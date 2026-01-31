import { motion } from "motion/react";
import type { Level } from "../../data/levels";
import type { PlayerDashboard } from "../../schemas";
import { cn } from "../../utils/cn";
import { LevelStatsCard } from "../LevelStatsCard/LevelStatsCard";

type LevelSelectorItemProps = {
  level: Level;
  levelData: PlayerDashboard[string] | undefined;
  isCurrentLevel: boolean;
  onClick: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
};

export const LevelSelectorItem = ({
  level,
  levelData: score,
  isCurrentLevel,
  onClick,
  scrollRef,
}: LevelSelectorItemProps) => {
  const bestScore = score?.user.best;
  const percentile = score?.user.percentile;
  const isPerfectScore =
    bestScore != null && bestScore <= (score?.global.best ?? Infinity);
  const hasScore = bestScore != null;

  // const variant = getVariant(isPerfectScore, hasScore);
  // const variantClasses = styleVariants[variant];

  const getPercentileLabel = () => {
    if (isPerfectScore) return null;
    if (percentile == null) return null;

    // If percentile is >= 50, we show "Top X%"
    // e.g. 90th percentile -> Top 10%
    if (percentile >= 50) {
      const topPercent = Math.max(1, Math.round(100 - percentile));
      return `Top ${topPercent}%`;
    }

    // If percentile is < 50, we show "Bottom X%"
    // e.g. 10th percentile -> Bottom 10%
    return `Bottom ${Math.max(1, Math.round(percentile))}%`;
  };

  const percentileLabel = getPercentileLabel();

  return (
    <div
      className="relative w-full"
      key={level.id}
      ref={isCurrentLevel ? scrollRef : null}
    >
      {isCurrentLevel && (
        <motion.div
          className="absolute -left-4 top-0 bottom-0 w-1 bg-tokyo-night-storm rounded-r-full"
          layoutId="active-level-indicator"
        />
      )}
      <button
        className={cn(
          "w-full cursor-pointer text-left p-3 transition-colors bg-tokyo-night-storm/20 hover:bg-tokyo-night-storm",
          isCurrentLevel && "bg-tokyo-night-storm",
        )}
        onClick={onClick}
        type="button"
      >
        <div className="flex justify-between items-center relative z-10">
          <div className="flex-1 space-y-1">
            <div className="text-[10px] opacity-60">Level {level.id}</div>
            <div className="text-xs">{level.name}</div>
          </div>
          {bestScore != null && (
            <div
              className={cn(
                "text-2xl font-roboto-mono text-transparent bg-clip-text flex flex-col items-center",
                isPerfectScore && "text-tokyo-night-gold",
                hasScore && !isPerfectScore && "text-tokyo-night-turquoise",
              )}
            >
              {bestScore}
              {percentileLabel && (
                <span
                  className={cn(
                    "text-[10px] opacity-75 whitespace-nowrap",
                    isPerfectScore && "text-tokyo-night-gold",
                    hasScore && !isPerfectScore && "text-tokyo-night-turquoise",
                  )}
                >
                  {percentileLabel}
                </span>
              )}
            </div>
          )}
        </div>

        <LevelStatsCard
          bestScoreLog={score?.global.best_score_log}
          globalAverage={score?.global.average}
          globalBest={score?.global.best}
        />
      </button>
    </div>
  );
};
