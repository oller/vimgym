import { useEffect, useId, useState } from "react";
import type {
  DailyAttempt,
  DailyDistributionPoint,
  DailyGlobalStats,
  DailyPuzzle,
  DailyRun,
  DailyUserStats,
} from "../../schemas/daily";
import { cn } from "../../utils/cn";
import {
  formatCountdown,
  formatDailyShareText,
  getMsUntilNextUtcMidnight,
  getScoreTier,
  TIER_META,
} from "../../utils/daily";
import { Modal } from "../Modals/Modal";
import { MotionSequencePills } from "../MotionLog/MotionLog";
import { Sparkline } from "../Sparkline/Sparkline";
import { AttemptTracker } from "./AttemptTracker";

type DailyResultsModalProps = {
  isOpen: boolean;
  puzzle: DailyPuzzle;
  run: DailyRun;
  attempts: DailyAttempt[];
  userStats: DailyUserStats | null;
  globalStats: DailyGlobalStats | null;
  distribution: DailyDistributionPoint[];
  onClose: () => void;
  onFreePractice: () => void;
};

export const DailyResultsModal = ({
  isOpen,
  puzzle,
  run,
  attempts,
  userStats,
  globalStats,
  distribution,
  onClose,
  onFreePractice,
}: DailyResultsModalProps) => {
  const titleId = useId();
  const [copied, setCopied] = useState(false);
  const [showParSolution, setShowParSolution] = useState(false);
  const [showGlobalBest, setShowGlobalBest] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{
    score: number;
    count: number;
  } | null>(null);
  const [countdown, setCountdown] = useState(() =>
    formatCountdown(getMsUntilNextUtcMidnight()),
  );

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCountdown(formatCountdown(getMsUntilNextUtcMidnight()));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const bestScore = run.best_score;
  const bestTier =
    bestScore !== null
      ? TIER_META[getScoreTier(bestScore, puzzle.par)]
      : TIER_META.abandoned;

  const winPct =
    userStats && userStats.games_played > 0
      ? Math.round((userStats.games_won / userStats.games_played) * 100)
      : 0;

  const handleShare = async () => {
    const text = formatDailyShareText({
      puzzleNumber: puzzle.puzzle_number,
      par: puzzle.par,
      bestScore,
      attempts,
      currentStreak: userStats?.current_streak ?? 0,
    });

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Modal
      ariaLabelledBy={titleId}
      className="max-w-lg border-tokyo-night-turquoise/70"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-5" data-testid="daily-results-modal">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="text-xs font-roboto-mono uppercase tracking-wider text-gray-400">
            Vimdle #{puzzle.puzzle_number} · {puzzle.title}
          </div>
          <h2
            className={cn("text-2xl font-roboto-mono", bestTier.textClass)}
            id={titleId}
          >
            {bestScore !== null
              ? `${bestTier.emoji} ${bestTier.label}`
              : "Out of Attempts"}
          </h2>
          <div className="flex items-center justify-center gap-3 font-roboto-mono text-sm pt-1">
            <span className="text-white">
              Best:{" "}
              <strong className="text-xl text-tokyo-night-turquoise">
                {bestScore ?? "—"}
              </strong>{" "}
              {bestScore !== null ? "keys" : ""}
            </span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">Par {puzzle.par}</span>
          </div>
        </div>

        {/* Attempt Progression Strip */}
        <div className="flex justify-center">
          <AttemptTracker
            activeKeystrokes={0}
            attemptSolved={false}
            attempts={attempts}
            par={puzzle.par}
            status={run.status}
          />
        </div>

        {/* Personal Stats Grid */}
        {userStats && (
          <div className="grid grid-cols-4 gap-2 text-center bg-tokyo-night/70 rounded-md p-3 border border-gray-800">
            <div>
              <div className="text-lg font-roboto-mono text-white">
                {userStats.games_played}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500">
                Played
              </div>
            </div>
            <div>
              <div className="text-lg font-roboto-mono text-white">
                {winPct}%
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500">
                Win Rate
              </div>
            </div>
            <div>
              <div className="text-lg font-roboto-mono text-tokyo-night-gold">
                {userStats.current_streak}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500">
                Streak
              </div>
            </div>
            <div>
              <div className="text-lg font-roboto-mono text-tokyo-night-lavender">
                {userStats.max_streak}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500">
                Max Streak
              </div>
            </div>
          </div>
        )}

        {/* Community Distribution */}
        {globalStats && (
          <div className="bg-tokyo-night/70 rounded-md p-3 border border-gray-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-roboto-mono">
              <span className="text-gray-400 uppercase tracking-wider text-[10px]">
                Today&apos;s Community Distribution
              </span>
              <span className="text-gray-400">
                {globalStats.solved_players}{" "}
                {globalStats.solved_players === 1 ? "solver" : "solvers"}
              </span>
            </div>

            <div className="flex items-end justify-between gap-4">
              <div className="space-y-1 font-roboto-mono text-xs min-w-28">
                {hoveredPoint ? (
                  <div className="text-tokyo-night-lavender">
                    {hoveredPoint.score} keys ({hoveredPoint.count})
                  </div>
                ) : (
                  <>
                    <div className="text-gray-300">
                      Avg:{" "}
                      <span className="text-tokyo-night-lavender">
                        {globalStats.avg_best_score !== null
                          ? Math.round(globalStats.avg_best_score * 10) / 10
                          : "—"}
                      </span>
                    </div>
                    <div className="text-gray-300">
                      Best:{" "}
                      <span className="text-tokyo-night-gold">
                        {globalStats.global_best_score ?? "—"}
                      </span>
                    </div>
                    {globalStats.user_percentile !== null && (
                      <div className="text-tokyo-night-turquoise">
                        Top{" "}
                        {Math.max(
                          1,
                          100 - Math.round(globalStats.user_percentile),
                        )}
                        %
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex-1 h-12 flex items-end">
                {distribution.length > 0 ? (
                  <Sparkline
                    className="size-full"
                    data={distribution}
                    onHover={setHoveredPoint}
                  />
                ) : (
                  <div className="w-full text-right text-[11px] text-gray-500">
                    No distribution data yet
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Spoiler-Guarded Solutions */}
        <div className="space-y-2">
          {puzzle.par_solution && puzzle.par_solution.length > 0 && (
            <div className="rounded-md border border-gray-800 bg-tokyo-night/60 overflow-hidden">
              <button
                aria-expanded={showParSolution}
                className="w-full cursor-pointer flex items-center justify-between px-3 py-2 text-xs font-roboto-mono text-gray-300 hover:text-white transition-colors"
                data-testid="reveal-par-solution-button"
                onClick={() => setShowParSolution((prev) => !prev)}
                type="button"
              >
                <span>
                  {showParSolution ? "Hide" : "Reveal"} Par Solution (
                  {puzzle.par_solution.length} keys)
                </span>
                <span className="text-gray-500">
                  {showParSolution ? "▲" : "▼"}
                </span>
              </button>
              {showParSolution && (
                <div
                  className="px-3 pb-3 pt-1 border-t border-gray-800"
                  data-testid="par-solution-content"
                >
                  <MotionSequencePills keystrokes={puzzle.par_solution} />
                </div>
              )}
            </div>
          )}

          {globalStats?.global_best_keystrokes &&
            globalStats.global_best_keystrokes.length > 0 && (
              <div className="rounded-md border border-gray-800 bg-tokyo-night/60 overflow-hidden">
                <button
                  aria-expanded={showGlobalBest}
                  className="w-full cursor-pointer flex items-center justify-between px-3 py-2 text-xs font-roboto-mono text-gray-300 hover:text-white transition-colors"
                  data-testid="reveal-global-best-button"
                  onClick={() => setShowGlobalBest((prev) => !prev)}
                  type="button"
                >
                  <span>
                    {showGlobalBest ? "Hide" : "Reveal"} Global Best (
                    {globalStats.global_best_score ??
                      globalStats.global_best_keystrokes.length}{" "}
                    keys)
                  </span>
                  <span className="text-gray-500">
                    {showGlobalBest ? "▲" : "▼"}
                  </span>
                </button>
                {showGlobalBest && (
                  <div
                    className="px-3 pb-3 pt-1 border-t border-gray-800"
                    data-testid="global-best-content"
                  >
                    <MotionSequencePills
                      keystrokes={globalStats.global_best_keystrokes}
                    />
                  </div>
                )}
              </div>
            )}
        </div>

        {/* Actions + Countdown */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-800">
          <div className="text-center sm:text-left">
            <div className="text-[10px] uppercase tracking-wider text-gray-500">
              Next Vimdle (UTC)
            </div>
            <div
              className="font-roboto-mono text-base text-gray-200"
              data-testid="utc-countdown"
            >
              {countdown}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              className="flex-1 sm:flex-none cursor-pointer px-4 py-2 rounded border border-gray-700 bg-tokyo-night hover:bg-slate-800 text-xs font-roboto-mono uppercase text-gray-200 transition-colors"
              data-testid="enter-free-practice-button"
              onClick={onFreePractice}
              type="button"
            >
              Free Practice
            </button>
            <button
              className="flex-1 sm:flex-none cursor-pointer px-4 py-2 rounded bg-tokyo-night-turquoise/25 hover:bg-tokyo-night-turquoise/35 border border-tokyo-night-turquoise/60 text-xs font-roboto-mono uppercase text-white transition-colors"
              data-testid="share-daily-button"
              onClick={handleShare}
              type="button"
            >
              {copied ? "Copied!" : "Share Result"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
