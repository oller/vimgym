import * as Tooltip from "@radix-ui/react-tooltip";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { StatsIcon } from "../icons/StatsIcon";
import { TrophyIcon } from "../icons/TrophyIcon";
import { VimKbd } from "../VimKbd";

type LevelSelectorItemRecordProps = {
  globalBest: number | null | undefined;
  bestScoreLog: string[] | null | undefined;
  onShowStats?: () => void;
};

export const LevelSelectorItemRecord = ({
  globalBest,
  bestScoreLog,
  onShowStats,
}: LevelSelectorItemRecordProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!globalBest) {
    return null;
  }

  return (
    <div className="flex justify-between text-xs font-medium tracking-wider uppercase mt-3">
      <Tooltip.Provider delayDuration={40}>
        <Tooltip.Root onOpenChange={setIsOpen} open={isOpen}>
          <Tooltip.Trigger asChild>
            <button
              className="flex items-center gap-1 group/global-best cursor-pointer h-7 min-w-7 relative before:absolute before:-inset-2 before:content-['']"
              type="button"
            >
              <TrophyIcon className="size-3 text-tokyo-night-gold" />
              <span className="group-hover/global-best:text-tokyo-night-gold transition-colors">
                {globalBest}
              </span>
            </button>
          </Tooltip.Trigger>

          <AnimatePresence>
            {isOpen && bestScoreLog && (
              <Tooltip.Portal forceMount>
                <Tooltip.Content
                  asChild
                  className="z-50"
                  side="top"
                  sideOffset={5}
                >
                  <motion.div
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <div className="shadow-xl bg-tokyo-night-storm p-2 text-xs font-roboto-mono text-gray-300 border-gray-700 border rounded-lg">
                      <div className="text-xs text-gray-500 mb-1 border-b border-gray-800 pb-1">
                        OPTIMUM RUN
                      </div>
                      <div className="flex flex-wrap gap-1 max-w-50">
                        {bestScoreLog.map((key, i) => (
                          <VimKbd
                            // biome-ignore lint/suspicious/noArrayIndexKey: array is static
                            key={`${key}-${i}`}
                          >
                            {key}
                          </VimKbd>
                        ))}
                      </div>
                      <Tooltip.Arrow className="fill-gray-900 border-t border-l border-gray-700" />
                    </div>
                  </motion.div>
                </Tooltip.Content>
              </Tooltip.Portal>
            )}
          </AnimatePresence>
          <button
            className="cursor-pointer flex items-center gap-1 text-gray-400 hover:text-white h-7 min-w-7 relative before:absolute before:-inset-2 before:content-['']"
            onClick={(e) => {
              e.stopPropagation();
              onShowStats?.();
            }}
            title="View Stats"
            type="button"
          >
            <span className="text-[10px] uppercase">Stats</span>
            <StatsIcon height={14} width={14} />
          </button>
        </Tooltip.Root>
      </Tooltip.Provider>
    </div>
  );
};
