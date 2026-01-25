import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Level } from "../../data/levels";
import { cn } from "../../utils/cn";
import { LevelStatsCard } from "../LevelStatsCard/LevelStatsCard";

type Variant = "perfect" | "completed" | "current" | "unplayed";

import type { PlayerDashboard } from "../../schemas";

type LevelSelectorItemProps = {
  level: Level;
  levelData: PlayerDashboard[string] | undefined;
  isCurrentLevel: boolean;
  onClick: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
};

const styleVariants = {
  perfect: ["bg-gold-gradient", "text-slate-800", "animate-shimmer"],
  completed: ["bg-green-600", "text-gray-200"],
  current: ["bg-tokyo-night-storm", "text-white"],
  unplayed: ["text-gray-400", "hover:bg-tokyo-night-storm"],
} as const;

const getVariant = (
  isPerfectScore: boolean,
  hasScore: boolean,
  isCurrentLevel: boolean,
): Variant => {
  if (isPerfectScore) return "perfect";
  if (hasScore) return "completed";
  if (isCurrentLevel) return "current";
  return "unplayed";
};

export const LevelSelectorItem = ({
  level,
  levelData: score,
  isCurrentLevel,
  onClick,
  scrollRef,
}: LevelSelectorItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const bestScore = score?.user.best;
  const percentile = score?.user.percentile;
  const isPerfectScore =
    bestScore != null && bestScore <= (score?.global.best ?? Infinity);
  const hasScore = bestScore != null;

  // 6 is the animation cycle duration
  // % 6 ensures we always have a delay between 0 and 6
  // level.id * 0.7 is for a pseudo-random delay without bringing in Math.random()
  const delay = (level.id * 0.7) % 6;

  const variant = getVariant(isPerfectScore, hasScore, isCurrentLevel);
  const variantClasses = styleVariants[variant];

  // Disable pointer events on the stats card container to prevent button click issues if necessary,
  // but usually it's fine inside a button.
  // We enable layout animation for smooth expanding.

  const getPercentileLabel = () => {
    if (isPerfectScore) return "Top score!";
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
          className="absolute -left-4 top-0 bottom-0 w-1 bg-slate-500 rounded-r-full"
          layoutId="active-level-indicator"
        />
      )}
      <button
        className={cn(
          "w-full cursor-pointer text-left p-3 transition-colors relative overflow-hidden",
          ...variantClasses,
        )}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={
          {
            "--shimmer-delay": `-${delay}s`,
          } as React.CSSProperties
        }
        type="button"
      >
        <motion.div layout>
          <div className="flex justify-between items-center relative z-10">
            <div className="flex-1 space-y-1">
              <div className="font-bold text-xs">Level {level.id}</div>
              <div className="text-xs">{level.name}</div>
            </div>
            {bestScore != null && (
              <div
                className={cn(
                  "text-xs font-roboto-mono flex flex-col items-center ",
                  // Ensure specific text color if needed, but inheriting is better generally
                )}
              >
                <span className="text-lg">{bestScore}</span>
                {percentileLabel && (
                  <span className="text-[10px] opacity-75 whitespace-nowrap">
                    {percentileLabel}
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {(isHovered || isCurrentLevel) && (
            <motion.div
              animate={{ height: "auto", opacity: 1 }}
              className="overflow-hidden"
              exit={{ height: 0, opacity: 0 }}
              initial={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <LevelStatsCard
                globalAverage={score?.global.average}
                globalBest={score?.global.best}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};
