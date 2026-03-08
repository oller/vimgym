import { AnimatePresence, motion } from "motion/react";
import type { Level, LevelCategory } from "../../data/levels";
import type { PlayerDashboard } from "../../schemas";
import { LevelSelectorItem } from "./LevelSelectorItem";

type LevelSelectorCategoryGroupProps = {
  category: LevelCategory;
  levels: Level[];
  isOpen: boolean;
  onToggle: () => void;
  currentLevel: string;
  dashboard: Record<string, PlayerDashboard[string]>;
  onSelect: (id: string) => void;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
};

export const LevelSelectorCategoryGroup = ({
  category,
  levels,
  isOpen,
  onToggle,
  currentLevel,
  dashboard,
  onSelect,
  scrollRef,
}: LevelSelectorCategoryGroupProps) => {
  const completedCount = levels.filter(
    (l) => dashboard[l.id]?.user?.best != null,
  ).length;

  return (
    <div className="">
      <button
        aria-expanded={isOpen}
        className="w-full flex justify-between items-center p-4 text-left cursor-pointer transition-colors group"
        onClick={onToggle}
        type="button"
      >
        <span className="text-[10px] uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors font-roboto-mono">
          {category}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-gray-600 group-hover:text-gray-300 transition-colors font-roboto-mono">
            {completedCount}/{levels.length}
          </span>
          <motion.span
            animate={{ rotate: isOpen ? 0 : -90 }}
            className="text-gray-600 text-lg leading-none"
            transition={{ duration: 0.15 }}
          >
            ▾
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            className="overflow-hidden space-y-2 pb-2 md:pl-4"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
          >
            {levels.map((level) => {
              const isCurrentLevel = level.id === currentLevel;
              return (
                <LevelSelectorItem
                  index={levels.indexOf(level) + 1}
                  isCurrentLevel={isCurrentLevel}
                  key={level.id}
                  level={level}
                  levelData={dashboard[level.id]}
                  onSelect={() => onSelect(level.id)}
                  ref={isCurrentLevel ? (scrollRef ?? null) : null}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
