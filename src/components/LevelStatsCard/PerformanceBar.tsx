import { motion } from "motion/react";

type PerformanceBarProps = {
  userScore: number;
  avgScore: number;
  bestPossibleScore: number;
};

export const PerformanceBar = ({
  userScore,
  avgScore,
  bestPossibleScore,
}: PerformanceBarProps) => {
  // Calculate relative positions (lower score is better)
  // Max scale value is slightly worse than average to show "worse" range
  const worstVisibleScore = avgScore * 1.5;
  const range = worstVisibleScore - bestPossibleScore;

  const getPosition = (score: number) => {
    // Clamp score between best possible and worst visible
    const clampedScore = Math.min(
      Math.max(score, bestPossibleScore),
      worstVisibleScore,
    );
    // Invert because lower is better (left side = best possible score)
    return ((clampedScore - bestPossibleScore) / range) * 100;
  };

  const userPos = getPosition(userScore);
  const avgPos = getPosition(avgScore);

  const isBetterThanAvg = userScore < avgScore;

  return (
    <div className="relative h-2 w-full bg-black/20 rounded-full overflow-hidden mt-1">
      {/* Background track handled by container class */}

      {/* Average Marker */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-current opacity-50 z-10"
        style={{ left: `${avgPos}%` }}
        title={`Average: ${Math.round(avgScore)}`}
      />

      {/* User Score Bar */}
      <motion.div
        animate={{ width: `${userPos}%` }}
        className={`absolute top-0 bottom-0 left-0 rounded-full ${
          isBetterThanAvg ? "bg-green-400" : "bg-red-400"
        }`}
        initial={{ width: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
};
