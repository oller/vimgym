import { AnimatePresence, motion } from "motion/react";
import type { Level, LevelCategory } from "../../data/levels";
import { useLevelSelectorContext } from "./LevelSelectorContext";
import { LevelSelectorItem } from "./LevelSelectorItem";

type LevelSelectorCategoryGroupProps = {
  levels: Level[];
  isOpen: boolean;
  onToggle: () => void;
};

export const LevelSelectorCategoryGroup = ({
  levels,
  isOpen,
  onToggle,
}: LevelSelectorCategoryGroupProps) => {
  const { dashboard } = useLevelSelectorContext();

  const category: LevelCategory = levels[0].category;
  const completedCount = levels.filter(
    (l) => dashboard[l.id]?.user?.best != null,
  ).length;
  const pct = completedCount / levels.length;

  return (
    <div className="">
      <button
        aria-expanded={isOpen}
        className="relative w-full flex justify-between items-center p-4 text-left cursor-pointer transition-colors group overflow-hidden"
        onClick={onToggle}
        type="button"
      >
        {/* Progress bar — flush to edges, sits at the bottom of the button */}
        <motion.div
          animate={{ scaleX: pct }}
          aria-hidden
          className="absolute left-0 right-0 bottom-0 h-0.5 origin-left"
          initial={{ scaleX: 0 }}
          style={{
            background:
              "linear-gradient(to right, transparent, var(--color-tokyo-night-lavender))",
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

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
            {levels.map((level, index) => (
              <LevelSelectorItem
                index={index + 1}
                key={level.id}
                level={level}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
