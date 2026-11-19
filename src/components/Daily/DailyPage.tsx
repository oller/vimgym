import { AnimatePresence, motion } from "motion/react";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useDailyState } from "../../hooks/api/useDaily";
import { getUserId } from "../../lib/analytics";
import { useDailyStore } from "../../store/useDailyStore";
import { useGameStore } from "../../store/useGameStore";
import { getUtcDateString } from "../../utils/daily";
import { MotionLog } from "../MotionLog/MotionLog";
import { EditorErrorBoundary } from "../VimEditor/EditorErrorBoundary";
import { DailyHeaderBar } from "./DailyHeaderBar";
import { DailyResultsModal } from "./DailyResultsModal";
import { HowToPlayDailyModal } from "./HowToPlayDailyModal";
import { TargetDiffPanel } from "./TargetDiffPanel";

const BaseVimEditor = lazy(() =>
  import("../VimEditor/BaseVimEditor").then((m) => ({
    default: m.BaseVimEditor,
  })),
);

const SEEN_HELP_KEY = "vimdle-seen-help-v1";

type DailyPageProps = {
  isHelpOpen: boolean;
  onCloseHelp: () => void;
  onOpenHelp: () => void;
};

export const DailyPage = ({
  isHelpOpen,
  onCloseHelp,
  onOpenHelp,
}: DailyPageProps) => {
  const userId = getUserId();
  const [activeUtcDate, setActiveUtcDate] = useState(() => getUtcDateString());
  const [hasNewDayBanner, setHasNewDayBanner] = useState(false);

  const { data, isLoading } = useDailyState(userId, activeUtcDate);

  const puzzle = useDailyStore((s) => s.puzzle);
  const run = useDailyStore((s) => s.run);
  const attempts = useDailyStore((s) => s.attempts);
  const userStats = useDailyStore((s) => s.userStats);
  const globalStats = useDailyStore((s) => s.globalStats);
  const distribution = useDailyStore((s) => s.distribution);
  const currentText = useDailyStore((s) => s.currentText);
  const editorInitialText = useDailyStore((s) => s.editorInitialText);
  const history = useDailyStore((s) => s.history);
  const attemptSolved = useDailyStore((s) => s.attemptSolved);
  const isFreePractice = useDailyStore((s) => s.isFreePractice);
  const practiceSolved = useDailyStore((s) => s.practiceSolved);
  const isSubmitting = useDailyStore((s) => s.isSubmitting);
  const resetCount = useDailyStore((s) => s.resetCount);
  const showResultsModal = useDailyStore((s) => s.showResultsModal);

  const hydrate = useDailyStore((s) => s.hydrate);
  const addKeyStroke = useDailyStore((s) => s.addKeyStroke);
  const updateText = useDailyStore((s) => s.updateText);
  const resetAttempt = useDailyStore((s) => s.resetAttempt);
  const startNextAttempt = useDailyStore((s) => s.startNextAttempt);
  const lockInRun = useDailyStore((s) => s.lockInRun);
  const enterFreePractice = useDailyStore((s) => s.enterFreePractice);
  const setShowResultsModal = useDailyStore((s) => s.setShowResultsModal);
  const setPoweredOff = useGameStore((s) => s.setPoweredOff);

  useEffect(() => {
    if (data) {
      hydrate(data);
    }
  }, [data, hydrate]);

  // Show How to Play once on first visit to /daily
  useEffect(() => {
    if (!localStorage.getItem(SEEN_HELP_KEY)) {
      localStorage.setItem(SEEN_HELP_KEY, "1");
      onOpenHelp();
    }
  }, [onOpenHelp]);

  // Detect UTC midnight rollover while the tab stays open
  useEffect(() => {
    const interval = setInterval(() => {
      const nowUtc = getUtcDateString();
      if (nowUtc !== activeUtcDate) {
        setHasNewDayBanner(true);
      }
    }, 15_000);
    return () => clearInterval(interval);
  }, [activeUtcDate]);

  const handleLoadNewDay = useCallback(() => {
    setHasNewDayBanner(false);
    useDailyStore.getState().clear();
    setActiveUtcDate(getUtcDateString());
  }, []);

  const handleChangeText = useCallback(
    (val: string) => {
      void updateText(val);
    },
    [updateText],
  );

  const handleReset = useCallback(() => {
    void resetAttempt();
  }, [resetAttempt]);

  const handleLockIn = useCallback(() => {
    void lockInRun();
  }, [lockInRun]);

  const handlePowerOff = useCallback(() => {
    setPoweredOff(true);
  }, [setPoweredOff]);

  if (isLoading || !puzzle || !run) {
    return (
      <div
        className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0"
        data-testid="daily-loading"
      >
        <div className="bg-tokyo-night-storm rounded-md animate-pulse border border-gray-800" />
        <div className="bg-tokyo-night-storm rounded-md animate-pulse border border-gray-800" />
      </div>
    );
  }

  const isEditorLocked = isFreePractice
    ? practiceSolved
    : run.status !== "in_progress" || attemptSolved || isSubmitting;

  const isEditorCompleted = isFreePractice ? practiceSolved : attemptSolved;

  return (
    <>
      <AnimatePresence>
        {isHelpOpen && (
          <HowToPlayDailyModal isOpen={isHelpOpen} onClose={onCloseHelp} />
        )}
        {showResultsModal && run.status !== "in_progress" && (
          <DailyResultsModal
            attempts={attempts}
            distribution={distribution}
            globalStats={globalStats}
            isOpen={showResultsModal}
            onClose={() => setShowResultsModal(false)}
            onFreePractice={enterFreePractice}
            puzzle={puzzle}
            run={run}
            userStats={userStats}
          />
        )}
      </AnimatePresence>

      <motion.main
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col gap-3 md:gap-4 min-h-0"
        data-testid="daily-page"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {hasNewDayBanner && (
          <div className="flex items-center justify-between px-4 py-2 rounded-md border border-tokyo-night-gold/60 bg-tokyo-night-gold/15 text-tokyo-night-gold text-xs font-roboto-mono shrink-0">
            <span>A new Vimdle puzzle is now live!</span>
            <button
              className="cursor-pointer underline font-bold hover:text-white"
              onClick={handleLoadNewDay}
              type="button"
            >
              Load Today&apos;s Puzzle
            </button>
          </div>
        )}

        <DailyHeaderBar
          attemptSolved={attemptSolved}
          attempts={attempts}
          historyLength={history.length}
          isFreePractice={isFreePractice}
          isSubmitting={isSubmitting}
          onLockIn={handleLockIn}
          onNextAttempt={startNextAttempt}
          onOpenResults={() => setShowResultsModal(true)}
          onReset={handleReset}
          practiceSolved={practiceSolved}
          puzzle={puzzle}
          run={run}
        />

        {/* Split Editor + Target/Diff Workspace */}
        <section className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 min-h-0">
          <div className="flex flex-col min-h-0">
            <EditorErrorBoundary onReset={handleReset}>
              <Suspense
                fallback={
                  <div className="grow bg-tokyo-night-storm rounded-md animate-pulse border border-gray-800" />
                }
              >
                <BaseVimEditor
                  blockPaste
                  editorKey={`${puzzle.id}-${resetCount}-${isFreePractice ? "practice" : "ranked"}`}
                  historyCount={history.length}
                  isCompleted={isEditorCompleted}
                  isReadOnly={isEditorLocked}
                  key={`${puzzle.id}-${resetCount}-${isFreePractice ? "practice" : "ranked"}`}
                  language={puzzle.language}
                  multiline
                  onChangeText={handleChangeText}
                  onKeyStroke={addKeyStroke}
                  onPowerOff={handlePowerOff}
                  onReset={handleReset}
                  showInlineTarget={false}
                  startCursor={{
                    line: puzzle.start_cursor_line,
                    ch: puzzle.start_cursor_ch,
                  }}
                  startText={editorInitialText}
                />
              </Suspense>
            </EditorErrorBoundary>
          </div>

          <TargetDiffPanel
            currentText={currentText}
            language={puzzle.language}
            targetText={puzzle.target_text}
          />
        </section>

        <div className="shrink-0">
          <MotionLog history={history} />
        </div>
      </motion.main>
    </>
  );
};
