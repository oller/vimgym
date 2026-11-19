import type { DailyAttempt, DailyPuzzle, DailyRun } from "../../schemas/daily";
import { MAX_DAILY_ATTEMPTS } from "../../schemas/daily";
import { cn } from "../../utils/cn";
import { getScoreTier, TIER_META } from "../../utils/daily";
import { AttemptTracker } from "./AttemptTracker";

type DailyHeaderBarProps = {
  puzzle: DailyPuzzle;
  run: DailyRun;
  attempts: DailyAttempt[];
  historyLength: number;
  attemptSolved: boolean;
  isFreePractice: boolean;
  practiceSolved: boolean;
  isSubmitting: boolean;
  onReset: () => void;
  onNextAttempt: () => void;
  onLockIn: () => void;
  onOpenResults: () => void;
};

const DIFFICULTY_STYLES = {
  easy: "bg-tokyo-night-turquoise/15 text-tokyo-night-turquoise border-tokyo-night-turquoise/40",
  medium:
    "bg-tokyo-night-gold/15 text-tokyo-night-gold border-tokyo-night-gold/40",
  hard: "bg-tokyo-night-peach/15 text-tokyo-night-peach border-tokyo-night-peach/40",
} as const;

export const DailyHeaderBar = ({
  puzzle,
  run,
  attempts,
  historyLength,
  attemptSolved,
  isFreePractice,
  practiceSolved,
  isSubmitting,
  onReset,
  onNextAttempt,
  onLockIn,
  onOpenResults,
}: DailyHeaderBarProps) => {
  const attemptsLeft = MAX_DAILY_ATTEMPTS - run.attempts_used;
  const lastAttempt = attempts[attempts.length - 1];
  const lastTier =
    lastAttempt && lastAttempt.outcome === "solved"
      ? TIER_META[getScoreTier(lastAttempt.keystrokes_count, puzzle.par)]
      : null;

  return (
    <div className="space-y-3 shrink-0">
      {/* Top Row: Puzzle Metadata + Attempt Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 font-roboto-mono">
            <span className="text-xs font-bold text-tokyo-night-pink uppercase tracking-wider">
              Vimdle #{puzzle.puzzle_number}
            </span>
            <span className="text-xs text-gray-500">{puzzle.puzzle_date}</span>
            <span
              className={cn(
                "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border",
                DIFFICULTY_STYLES[puzzle.difficulty],
              )}
            >
              {puzzle.difficulty}
            </span>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-tokyo-night-sapphire/40 bg-tokyo-night-sapphire/15 text-tokyo-night-sapphire">
              Par {puzzle.par}
            </span>
            {isFreePractice && (
              <span
                className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-tokyo-night-lavender/50 bg-tokyo-night-lavender/15 text-tokyo-night-lavender"
                data-testid="free-practice-badge"
              >
                Free Practice
              </span>
            )}
          </div>
          <h2 className="text-base md:text-lg font-medium text-white">
            {puzzle.title}
          </h2>
          <p className="text-sm text-gray-400">{puzzle.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isFreePractice && (
            <AttemptTracker
              activeKeystrokes={historyLength}
              attemptSolved={attemptSolved}
              attempts={attempts}
              par={puzzle.par}
              status={run.status}
            />
          )}

          <div className="flex items-center gap-2">
            {isFreePractice ? (
              <>
                <button
                  className="cursor-pointer text-xs bg-tokyo-night-storm hover:bg-slate-700/60 text-white px-3 py-2 rounded border border-gray-700 transition-colors font-roboto-mono uppercase"
                  onClick={onReset}
                  type="button"
                >
                  {practiceSolved ? "Practice Again" : "Reset"}
                </button>
                <button
                  className="cursor-pointer text-xs bg-tokyo-night-turquoise/20 hover:bg-tokyo-night-turquoise/30 text-tokyo-night-turquoise px-3 py-2 rounded border border-tokyo-night-turquoise/50 transition-colors font-roboto-mono uppercase"
                  onClick={onOpenResults}
                  type="button"
                >
                  Results
                </button>
              </>
            ) : run.status === "in_progress" ? (
              <>
                {!attemptSolved && (
                  <button
                    className="cursor-pointer text-xs bg-tokyo-night-storm hover:bg-slate-700/60 disabled:opacity-50 text-white px-3 py-2 rounded border border-gray-700 transition-colors font-roboto-mono uppercase"
                    data-testid="daily-reset-button"
                    disabled={isSubmitting}
                    onClick={onReset}
                    title={
                      historyLength > 0
                        ? "Resetting after typing consumes 1 attempt"
                        : "Reset buffer"
                    }
                    type="button"
                  >
                    {historyLength > 0 ? "Reset (−1 try)" : "Reset"}
                  </button>
                )}

                {run.best_score !== null && !attemptSolved && (
                  <button
                    className="cursor-pointer text-xs bg-tokyo-night-turquoise/20 hover:bg-tokyo-night-turquoise/30 disabled:opacity-50 text-tokyo-night-turquoise px-3 py-2 rounded border border-tokyo-night-turquoise/50 transition-colors font-roboto-mono uppercase"
                    data-testid="daily-lock-in-button"
                    disabled={isSubmitting}
                    onClick={onLockIn}
                    type="button"
                  >
                    Lock In ({run.best_score})
                  </button>
                )}
              </>
            ) : (
              <button
                className="cursor-pointer text-xs bg-tokyo-night-turquoise/20 hover:bg-tokyo-night-turquoise/30 text-tokyo-night-turquoise px-3 py-2 rounded border border-tokyo-night-turquoise/50 transition-colors font-roboto-mono uppercase"
                onClick={onOpenResults}
                type="button"
              >
                View Results
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline Post-Attempt Action Bar (when attempt solved and attempts remain) */}
      {!isFreePractice &&
        attemptSolved &&
        run.status === "in_progress" &&
        lastAttempt && (
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-md border border-tokyo-night-turquoise/50 bg-tokyo-night-turquoise/10"
            data-testid="attempt-solved-banner"
          >
            <div className="flex items-center gap-2 font-roboto-mono text-sm">
              <span className="text-tokyo-night-turquoise font-bold">
                Solved in {lastAttempt.keystrokes_count} keys
              </span>
              {lastTier && (
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded border",
                    lastTier.bgClass,
                    lastTier.borderClass,
                    lastTier.textClass,
                  )}
                >
                  {lastTier.emoji} {lastTier.label}
                </span>
              )}
              <span className="text-xs text-gray-400">
                (Best: {run.best_score})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="cursor-pointer text-xs bg-tokyo-night-pink/20 hover:bg-tokyo-night-pink/30 text-tokyo-night-pink px-3 py-1.5 rounded border border-tokyo-night-pink/50 transition-colors font-roboto-mono uppercase"
                data-testid="try-again-button"
                disabled={isSubmitting}
                onClick={onNextAttempt}
                type="button"
              >
                Try Again ({attemptsLeft} left)
              </button>
              <button
                className="cursor-pointer text-xs bg-tokyo-night-turquoise/20 hover:bg-tokyo-night-turquoise/30 text-tokyo-night-turquoise px-3 py-1.5 rounded border border-tokyo-night-turquoise/50 transition-colors font-roboto-mono uppercase"
                data-testid="lock-in-score-button"
                disabled={isSubmitting}
                onClick={onLockIn}
                type="button"
              >
                Lock In &amp; Results
              </button>
            </div>
          </div>
        )}

      {/* Free Practice Solved Notice */}
      {isFreePractice && practiceSolved && (
        <div
          className="flex items-center justify-between px-4 py-2 rounded-md border border-tokyo-night-lavender/50 bg-tokyo-night-lavender/10 font-roboto-mono text-xs text-tokyo-night-lavender"
          data-testid="practice-solved-banner"
        >
          <span>
            Practice solved in {historyLength} keys! (Unranked — official score
            stays {run.best_score ?? "—"})
          </span>
          <button
            className="cursor-pointer underline hover:text-white"
            onClick={onReset}
            type="button"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
};
