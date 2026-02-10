import { motion } from "motion/react";
import { useState } from "react";
import type { Level } from "../../data/levels";
import type { PlayerDashboard } from "../../schemas";
import { cn } from "../../utils/cn";
import { LevelSelectorItemScoreCard } from "./LevelSelectorItemScoreCard";
import { LevelSelectorItemStatsCard } from "./LevelSelectorItemStatsCard";

type LevelSelectorItemProps = {
  index: number;
  level: Level;
  levelData: PlayerDashboard[string] | undefined;
  isCurrentLevel: boolean;
  onSelect: () => void;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
};

export const LevelSelectorItem = ({
  level,
  levelData,
  isCurrentLevel,
  onSelect,
  className,
  index,
  ref,
}: LevelSelectorItemProps) => {
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  return (
    <div
      className={cn(
        "relative w-full shrink-0 transition-colors bg-tokyo-night-storm/20 hover:bg-tokyo-night-storm group",
        className,
      )}
      ref={ref}
    >
      {isCurrentLevel && (
        <motion.div
          className="absolute -left-4 top-0 bottom-0 w-1 bg-tokyo-night-storm rounded-r-full z-50"
          layoutId="active-level-indicator"
        />
      )}
      <div className="w-full overflow-hidden">
        <motion.div
          animate={{ x: isStatsOpen ? "-50%" : "0%" }}
          className="flex w-[200%]"
          transition={{ type: "spring", stiffness: 300, damping: 35 }}
        >
          <LevelSelectorItemScoreCard
            index={index}
            isCurrentLevel={isCurrentLevel}
            level={level}
            onClick={onSelect}
            onShowStats={() => setIsStatsOpen(true)}
            score={levelData}
          />
          <LevelSelectorItemStatsCard
            index={index}
            isStatsOpen={isStatsOpen}
            level={level}
            onCloseStats={() => setIsStatsOpen(false)}
            score={levelData}
          />
        </motion.div>
      </div>
    </div>
  );
};
