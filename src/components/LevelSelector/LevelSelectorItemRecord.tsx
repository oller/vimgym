import * as Popover from "@radix-ui/react-popover";
import * as Tooltip from "@radix-ui/react-tooltip";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { explainSequence } from "vimsplain";
import { StatsIcon } from "../icons/StatsIcon";
import { TrophyIcon } from "../icons/TrophyIcon";
import { MotionLogItem } from "../MotionLog/MotionLogItem";
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
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const hasBestScoreLog = Boolean(bestScoreLog && bestScoreLog.length > 0);

  const explanation = useMemo(() => {
    if (!isPopoverOpen || !bestScoreLog || bestScoreLog.length === 0) {
      return null;
    }
    return explainSequence(bestScoreLog.join(""));
  }, [isPopoverOpen, bestScoreLog]);

  if (!globalBest) {
    return null;
  }

  const showTooltip = hasBestScoreLog && !isPopoverOpen && isTooltipOpen;
  const showPopover = hasBestScoreLog && isPopoverOpen;

  return (
    <div className="flex justify-between items-center text-xs font-medium tracking-wider uppercase mt-3">
      <Popover.Root
        onOpenChange={(open) => {
          if (!hasBestScoreLog) {
            setIsPopoverOpen(false);
            return;
          }
          setIsPopoverOpen(open);
          if (open) {
            setIsTooltipOpen(false);
          }
        }}
        open={showPopover}
      >
        <Tooltip.Provider delayDuration={40}>
          <Tooltip.Root
            onOpenChange={(open) => {
              if (!hasBestScoreLog || isPopoverOpen) {
                setIsTooltipOpen(false);
                return;
              }
              setIsTooltipOpen(open);
            }}
            open={showTooltip}
          >
            <Tooltip.Trigger asChild>
              <Popover.Trigger asChild>
                <button
                  className="flex items-center gap-1 group/global-best cursor-pointer h-7 min-w-7 relative before:absolute before:-inset-2 before:content-['']"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  type="button"
                >
                  <TrophyIcon className="size-3 text-tokyo-night-gold" />
                  <span className="group-hover/global-best:text-tokyo-night-gold transition-colors">
                    {globalBest}
                  </span>
                </button>
              </Popover.Trigger>
            </Tooltip.Trigger>

            <AnimatePresence>
              {showTooltip && bestScoreLog && (
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
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 25,
                      }}
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
                        <div className="text-[10px] text-gray-500 mt-1.5 normal-case">
                          Click to explain
                        </div>
                        <Tooltip.Arrow className="fill-gray-900 border-t border-l border-gray-700" />
                      </div>
                    </motion.div>
                  </Tooltip.Content>
                </Tooltip.Portal>
              )}
            </AnimatePresence>
          </Tooltip.Root>
        </Tooltip.Provider>

        {showPopover && bestScoreLog && (
          <Popover.Portal>
            <Popover.Content
              align="start"
              className="z-50 shadow-xl bg-tokyo-night-storm p-2 text-xs font-roboto-mono text-gray-300 border-gray-700 border rounded-lg max-w-72 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
              }}
              side="top"
              sideOffset={5}
            >
              <div className="text-xs text-gray-500 mb-1 border-b border-gray-800 pb-1">
                OPTIMUM RUN
              </div>
              <div className="flex flex-wrap gap-1 max-w-64 mb-2">
                {bestScoreLog.map((key, i) => (
                  <VimKbd
                    // biome-ignore lint/suspicious/noArrayIndexKey: array is static
                    key={`${key}-${i}`}
                  >
                    {key}
                  </VimKbd>
                ))}
              </div>
              {explanation && (
                <div className="flex flex-col gap-1 max-h-48 overflow-y-auto border-t border-gray-800 pt-1.5 normal-case">
                  {explanation.commands.map((cmd, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: array is static
                    <MotionLogItem command={cmd} key={`${cmd.matched}-${i}`} />
                  ))}
                  {explanation.remaining && (
                    <div className="flex items-center gap-1 bg-slate-700/50 rounded overflow-hidden">
                      <VimKbd className="text-tokyo-night-gold">
                        {explanation.remaining}
                      </VimKbd>
                    </div>
                  )}
                </div>
              )}
              <Popover.Arrow className="fill-gray-900 border-t border-l border-gray-700" />
            </Popover.Content>
          </Popover.Portal>
        )}
      </Popover.Root>

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
    </div>
  );
};
