import * as Tooltip from "@radix-ui/react-tooltip";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
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
              className="flex items-center gap-1 group cursor-pointer"
              type="button"
            >
              <svg
                className="size-3 text-tokyo-night-gold"
                fill="currentColor"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Trophy</title>
                <path
                  clipRule="evenodd"
                  d="M12 1.69a.494.494 0 0 0-.438-.494 32.352 32.352 0 0 0-7.124 0A.494.494 0 0 0 4 1.689v.567c-.811.104-1.612.24-2.403.406a.75.75 0 0 0-.595.714 4.5 4.5 0 0 0 4.35 4.622A3.99 3.99 0 0 0 7 8.874V10H6a1 1 0 0 0-1 1v2h-.667C3.597 13 3 13.597 3 14.333c0 .368.298.667.667.667h8.666a.667.667 0 0 0 .667-.667c0-.736-.597-1.333-1.333-1.333H11v-2a1 1 0 0 0-1-1H9V8.874a3.99 3.99 0 0 0 1.649-.876 4.5 4.5 0 0 0 4.35-4.622.75.75 0 0 0-.596-.714A30.897 30.897 0 0 0 12 2.256v-.567ZM4 3.768c-.49.066-.976.145-1.458.235a3.004 3.004 0 0 0 1.64 2.192A3.999 3.999 0 0 1 4 5V3.769Zm8 0c.49.066.976.145 1.458.235a3.004 3.004 0 0 1-1.64 2.192C11.936 5.818 12 5.416 12 5V3.769Z"
                  fillRule="evenodd"
                />
              </svg>
              <span className="group-hover:text-tokyo-night-gold transition-colors">
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
            className="cursor-pointer flex items-center gap-1 text-gray-400 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onShowStats?.();
            }}
            title="View Stats"
            type="button"
          >
            <span className="text-[10px] uppercase">Stats</span>
            <svg
              fill="currentColor"
              height="14"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="14"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>View stats</title>
              <line x1="18" x2="18" y1="20" y2="10" />
              <line x1="12" x2="12" y1="20" y2="4" />
              <line x1="6" x2="6" y1="20" y2="14" />
            </svg>
          </button>
        </Tooltip.Root>
      </Tooltip.Provider>
    </div>
  );
};
