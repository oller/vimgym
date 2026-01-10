import { motion } from "motion/react";
import type { Level } from "../../data/levels";
import { cn } from "../../utils/cn";

type Variant = "perfect" | "completed" | "current" | "unplayed";

type LevelSelectorItemProps = {
  level: Level;
  score: number | undefined;
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
  score,
  isCurrentLevel,
  onClick,
  scrollRef,
}: LevelSelectorItemProps) => {
  const isPerfectScore =
    score !== undefined && score <= (level.perfectScore ?? Infinity);
  const hasScore = score !== undefined;

  // 6 is the animation cycle duration
  // % 6 ensures we always have a delay between 0 and 6
  // level.id * 0.7 is for a pseudo-random delay without bringing in Math.random()
  const delay = (level.id * 0.7) % 6;

  const variant = getVariant(isPerfectScore, hasScore, isCurrentLevel);
  const variantClasses = styleVariants[variant];

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
          ...variantClasses,
        )}
        onClick={onClick}
        style={
          {
            "--shimmer-delay": `-${delay}s`,
          } as React.CSSProperties
        }
        type="button"
      >
        <div className="flex justify-between items-center">
          <div className="flex-1 space-y-1">
            <div className="font-bold text-xs">Level {level.id}</div>
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
};
