import { motion } from "motion/react";
import { useState } from "react";
import type { Level } from "../../data/levels";
import { useLevelScoreDistribution } from "../../hooks/api";
import type { PlayerDashboard } from "../../schemas";
import { cn } from "../../utils/cn";
import { LevelStatsCard } from "../LevelStatsCard/LevelStatsCard";
import { Sparkline } from "../Sparkline/Sparkline";

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
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const bestScore = score?.user.best;
  const percentile = score?.user.percentile;
  const isPerfectScore =
    bestScore != null && bestScore <= (score?.global.best ?? Infinity);
  const hasScore = bestScore != null;
  const [hoveredPoint, setHoveredPoint] = useState<{
    score: number;
    count: number;
  } | null>(null);

  const { data: distribution } = useLevelScoreDistribution(
    level.id,
    isStatsOpen,
  );

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
      className="relative w-full overflow-hidden shrink-0 transition-colors bg-tokyo-night-storm/20 hover:bg-tokyo-night-storm group"
      key={level.id}
      ref={isCurrentLevel ? scrollRef : null}
    >
      {isCurrentLevel && (
        <motion.div
          className="absolute -left-4 top-0 bottom-0 w-1 bg-tokyo-night-storm rounded-r-full z-10"
          layoutId="active-level-indicator"
        />
      )}

      {/* Slider Container */}
      <motion.div
        animate={{ x: isStatsOpen ? "-50%" : "0%" }}
        className="flex w-[200%]"
        transition={{ type: "spring", stiffness: 300, damping: 35 }}
      >
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
                <div className="text-[10px] text-gray-500">
                  LEVEL {level.id}
                </div>
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
                        hasScore &&
                          !isPerfectScore &&
                          "text-tokyo-night-turquoise",
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
              globalBest={score?.global.best}
              onShowStats={() => setIsStatsOpen(true)}
            />
          </button>
        </div>

        {/* STATS VIEW */}
        <div className="w-1/2 bg-tokyo-night-storm p-3 flex flex-col justify-between">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 space-y-1">
              <div className="text-[10px] text-gray-500">
                LEVEL {level.id} STATS
              </div>
            </div>
            <button
              aria-label="Close stats"
              className="text-gray-500 hover:text-white transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsStatsOpen(false);
              }}
              type="button"
            >
              <svg
                fill="none"
                height="14"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="14"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Close stats</title>
                <line x1="18" x2="6" y1="6" y2="18" />
                <line x1="6" x2="18" y1="6" y2="18" />
              </svg>
            </button>
          </div>

          <div className="flex justify-between items-end gap-2 mt-3">
            <div className="flex flex-col gap-1 min-w-20">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                {hoveredPoint ? "Score" : "Avg Score"}
              </span>
              <span className="text-lg font-roboto-mono text-tokyo-night-purple">
                {hoveredPoint ? (
                  <span className="flex items-baseline gap-1">
                    {hoveredPoint.score}
                    <span className="text-[10px] text-gray-500 font-sans">
                      ({hoveredPoint.count}{" "}
                      {hoveredPoint.count === 1 ? "player" : "players"})
                    </span>
                  </span>
                ) : score?.global.average ? (
                  Math.round(score.global.average * 10) / 10
                ) : (
                  "-"
                )}
              </span>
            </div>

            <div className="flex-1 h-10 flex items-end justify-end pb-1">
              {distribution && distribution.length > 0 ? (
                <Sparkline
                  data={distribution}
                  height={40}
                  onHover={setHoveredPoint}
                  width={140}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-end text-[10px] text-gray-500">
                  {distribution ? (
                    "No data yet"
                  ) : (
                    <span className="loading loading-dots loading-xs text-gray-600"></span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
