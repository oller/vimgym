import type { DailyAttempt, DailyRunStatus } from "../../schemas/daily";
import { MAX_DAILY_ATTEMPTS } from "../../schemas/daily";
import { cn } from "../../utils/cn";
import { getAttemptTier, TIER_META } from "../../utils/daily";

type AttemptTrackerProps = {
  attempts: DailyAttempt[];
  par: number;
  status: DailyRunStatus;
  activeKeystrokes: number;
  attemptSolved: boolean;
};

export const AttemptTracker = ({
  attempts,
  par,
  status,
  activeKeystrokes,
  attemptSolved,
}: AttemptTrackerProps) => {
  const slots = Array.from({ length: MAX_DAILY_ATTEMPTS }, (_, idx) => {
    const attemptNumber = idx + 1;
    const completed = attempts[idx];
    const isActive =
      !completed &&
      status === "in_progress" &&
      !attemptSolved &&
      idx === attempts.length;

    return { attemptNumber, completed, isActive };
  });

  return (
    <ol
      aria-label="Daily attempts"
      className="flex items-center gap-1.5 sm:gap-2"
      data-testid="attempt-tracker"
    >
      {slots.map(({ attemptNumber, completed, isActive }) => {
        if (completed) {
          const tier = getAttemptTier(completed, par);
          const meta = TIER_META[tier];
          return (
            <li
              className={cn(
                "flex items-center justify-center gap-1 min-w-11 h-7 px-2 rounded border font-roboto-mono text-xs transition-colors",
                meta.bgClass,
                meta.borderClass,
                meta.textClass,
              )}
              data-testid={`attempt-slot-${attemptNumber}`}
              key={attemptNumber}
              title={`Attempt ${attemptNumber}: ${
                completed.outcome === "abandoned"
                  ? "Reset"
                  : `${completed.keystrokes_count} keys (${meta.label})`
              }`}
            >
              <span className="text-[10px] opacity-60">{attemptNumber}</span>
              <span className="font-bold">
                {completed.outcome === "abandoned"
                  ? "—"
                  : completed.keystrokes_count}
              </span>
            </li>
          );
        }

        if (isActive) {
          return (
            <li
              className="flex items-center justify-center gap-1 min-w-11 h-7 px-2 rounded border border-tokyo-night-pink/70 bg-tokyo-night-pink/10 text-tokyo-night-pink font-roboto-mono text-xs"
              data-testid={`attempt-slot-${attemptNumber}`}
              key={attemptNumber}
              title={`Active attempt ${attemptNumber}`}
            >
              <span className="text-[10px] opacity-70">{attemptNumber}</span>
              <span className="font-bold">
                {activeKeystrokes > 0 ? activeKeystrokes : "•"}
              </span>
            </li>
          );
        }

        return (
          <li
            className="flex items-center justify-center min-w-11 h-7 px-2 rounded border border-dashed border-gray-800 text-gray-600 font-roboto-mono text-xs"
            data-testid={`attempt-slot-${attemptNumber}`}
            key={attemptNumber}
            title={`Attempt ${attemptNumber} remaining`}
          >
            <span className="text-[10px]">{attemptNumber}</span>
          </li>
        );
      })}
    </ol>
  );
};
