import { motion } from "motion/react";
import type { PropsWithChildren } from "react";
import { forwardRef, useState } from "react";
import type { Level } from "../../data/levels";
import type { PlayerDashboard } from "../../schemas";
import { cn } from "../../utils/cn";
import { LevelSelectorItemContext } from "./LevelSelectorItemContext";
import { LevelSelectorItemStats } from "./LevelSelectorItemStats";
import { LevelSelectorItemTrigger } from "./LevelSelectorItemTrigger";

// --- Item Root ---
type LevelSelectorItemProps = {
  level: Level;
  levelData: PlayerDashboard[string] | undefined;
  isCurrentLevel: boolean;
  className?: string;
};

// biome-ignore lint/style/useComponentExportOnlyModules: Allow local component for compound pattern
const LevelSelectorItemRoot = forwardRef<
  HTMLDivElement,
  PropsWithChildren<LevelSelectorItemProps>
>(({ level, levelData, isCurrentLevel, children, className }, ref) => {
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  return (
    <LevelSelectorItemContext.Provider
      value={{
        level,
        levelData,
        isCurrentLevel,
        isStatsOpen,
        setIsStatsOpen,
      }}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden shrink-0 transition-colors bg-tokyo-night-storm/20 hover:bg-tokyo-night-storm group",
          className,
        )}
        ref={ref}
      >
        {isCurrentLevel && (
          <motion.div
            className="absolute -left-4 top-0 bottom-0 w-1 bg-tokyo-night-storm rounded-r-full z-10"
            layoutId="active-level-indicator"
          />
        )}
        <motion.div
          animate={{ x: isStatsOpen ? "-50%" : "0%" }}
          className="flex w-[200%]"
          transition={{ type: "spring", stiffness: 300, damping: 35 }}
        >
          {children}
        </motion.div>
      </div>
    </LevelSelectorItemContext.Provider>
  );
});

LevelSelectorItemRoot.displayName = "LevelSelectorItem";

// Use Object.assign to create the compound component with dot notation
export const LevelSelectorItem = Object.assign(LevelSelectorItemRoot, {
  Trigger: LevelSelectorItemTrigger,
  Stats: LevelSelectorItemStats,
});
