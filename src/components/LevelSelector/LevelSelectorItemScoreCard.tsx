import type { Level } from "../../data/levels";
import type { PlayerDashboard } from "../../schemas";
import { cn } from "../../utils/cn";
import { LevelSelectorItemRecord } from "./LevelSelectorItemRecord";

type LevelSelectorItemScoreCardProps = {
  level: Level;
  score: PlayerDashboard[string] | undefined;
  isCurrentLevel: boolean;
  onClick: () => void;
  onShowStats: () => void;
};

export const LevelSelectorItemScoreCard = ({
  level,
  score,
  isCurrentLevel,
  onClick,
  onShowStats,
}: LevelSelectorItemScoreCardProps) => {
  const bestScore = score?.user.best;
  const percentile = score?.user.percentile;
  const isPerfectScore =
    bestScore != null && bestScore <= (score?.global.best ?? Infinity);
  const hasScore = bestScore != null;

  const getPercentileLabel = () => {
    if (isPerfectScore) return null;
    if (percentile == null) return null;

    if (percentile >= 50) {
      const topPercent = Math.max(1, Math.round(100 - percentile));
      return `Top ${topPercent}%`;
    }

    return `Bottom ${Math.max(1, Math.round(percentile))}%`;
  };

  const percentileLabel = getPercentileLabel();

  return (
    <div className="w-1/2">
      <button
        className={cn(
          "w-full cursor-pointer text-left p-3 group h-full flex flex-col justify-between",
          isCurrentLevel && "bg-tokyo-night-storm",
        )}
        onClick={onClick}
        type="button"
      >
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 space-y-1">
            <div className="text-[10px] text-gray-500">LEVEL {level.id}</div>
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

        <LevelSelectorItemRecord
          bestScoreLog={score?.global.best_score_log}
          globalBest={score?.global.best}
          onShowStats={onShowStats}
        />
      </button>
    </div>
  );
};
