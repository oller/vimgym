import { AnimatePresence, motion } from "motion/react";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";

import { hasFinishedDailyLocally } from "./api/daily";
import { CrtEffect } from "./components/CrtEffect";
import { GoalDisplay } from "./components/GoalDisplay/GoalDisplay";
import { GitHubIcon } from "./components/icons/GitHubIcon";
import { Logo } from "./components/Logo/Logo";
import { MotionLog } from "./components/MotionLog/MotionLog";
import { EditorErrorBoundary } from "./components/VimEditor/EditorErrorBoundary";
import { LEVELS } from "./data/levels";
import { useLevelId } from "./hooks/useLevelId";
import { useRoute } from "./hooks/useRoute";
import { useDailyStore } from "./store/useDailyStore";
import { useGameStore } from "./store/useGameStore";
import { cn } from "./utils/cn";

const VimEditor = lazy(() =>
  import("./components/VimEditor/VimEditor").then((m) => ({
    default: m.VimEditor,
  })),
);
const LevelSelector = lazy(() =>
  import("./components/LevelSelector/LevelSelector").then((m) => ({
    default: m.LevelSelector,
  })),
);
const AboutModal = lazy(() =>
  import("./components/Modals/AboutModal").then((m) => ({
    default: m.AboutModal,
  })),
);
const CompletionModal = lazy(() =>
  import("./components/Modals/CompletionModal").then((m) => ({
    default: m.CompletionModal,
  })),
);
const DailyPage = lazy(() =>
  import("./components/Daily/DailyPage").then((m) => ({
    default: m.DailyPage,
  })),
);

const ClassicGymView = () => {
  const [levelId, setLevelId] = useLevelId();
  const setLevel = useGameStore((state) => state.setLevel);
  const resetCount = useGameStore((state) => state.resetCount);
  const resetLevel = useGameStore((state) => state.resetLevel);
  const isCompleted = useGameStore((state) => state.isCompleted);

  // Validate level exists
  const isValidLevel = LEVELS.some((l) => l.id === levelId);
  const currentLevelId = isValidLevel && levelId ? levelId : LEVELS[0].id;

  const currentLevelIndex = LEVELS.findIndex((l) => l.id === currentLevelId);
  const hasNextLevel =
    currentLevelIndex !== -1 && currentLevelIndex < LEVELS.length - 1;

  const handleNextLevel = () => {
    if (hasNextLevel) {
      const nextLevel = LEVELS[currentLevelIndex + 1];
      setLevelId(nextLevel.id);
    }
  };

  useEffect(() => {
    // If invalid level in URL, redirect to 1 (delete-words)
    if (!isValidLevel || !levelId) {
      setLevelId("delete-words");
      return;
    }
    setLevel(currentLevelId);
  }, [currentLevelId, setLevel, isValidLevel, levelId, setLevelId]);

  return (
    <>
      <AnimatePresence>
        {isCompleted && (
          <Suspense fallback={null}>
            <CompletionModal
              hasNextLevel={hasNextLevel}
              onNext={handleNextLevel}
            />
          </Suspense>
        )}
      </AnimatePresence>

      <motion.main
        animate={{ opacity: 1, filter: "blur(0px)" }}
        className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-6 min-h-0"
        initial={{ opacity: 0, filter: "blur(10px)" }}
        layout
        transition={{ duration: 0.2, ease: "easeOut", delay: 0.8 }}
      >
        {/* Main Content */}
        <motion.section
          className="flex-1 md:h-full md:col-span-9 lg:col-span-10 flex flex-col gap-2 md:gap-6 min-h-0"
          layout
        >
          <GoalDisplay />

          <div className="flex flex-col grow min-h-0">
            <EditorErrorBoundary onReset={resetLevel}>
              <Suspense
                fallback={
                  <div className="grow bg-tokyo-night-storm rounded-md animate-pulse border border-gray-800" />
                }
              >
                <VimEditor key={`${levelId}-${resetCount}`} />
              </Suspense>
            </EditorErrorBoundary>
          </div>

          <motion.div className="shrink-0" layout>
            <MotionLog />
          </motion.div>
        </motion.section>

        {/* Right: Level Selector */}
        <motion.aside
          className="h-32 md:h-full md:col-span-3 lg:col-span-2 flex min-h-0 shrink-0"
          layout
        >
          <nav aria-label="Level list" className="w-full h-full">
            <Suspense
              fallback={
                <div className="w-full bg-tokyo-night rounded-md animate-pulse border-l border-gray-800" />
              }
            >
              <LevelSelector />
            </Suspense>
          </nav>
        </motion.aside>
      </motion.main>
    </>
  );
};

const Home = () => {
  const [route, navigate] = useRoute();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isDailyHelpOpen, setIsDailyHelpOpen] = useState(false);

  const dailyRun = useDailyStore((s) => s.run);
  const dailyUserStats = useDailyStore((s) => s.userStats);

  const isDailyFinished = dailyRun
    ? dailyRun.status !== "in_progress"
    : hasFinishedDailyLocally();

  const handleOpenDailyHelp = useCallback(() => {
    setIsDailyHelpOpen(true);
  }, []);

  const handleCloseDailyHelp = useCallback(() => {
    setIsDailyHelpOpen(false);
  }, []);

  useEffect(() => {
    document.title = route === "/daily" ? "Vimdle · VimGym" : "VimGym";
  }, [route]);

  return (
    <CrtEffect>
      <div className="h-dvh overflow-hidden bg-tokyo-night text-white flex flex-col p-4 md:p-6 font-sans relative">
        <AnimatePresence>
          {isAboutOpen && (
            <Suspense fallback={null}>
              <AboutModal
                isOpen={isAboutOpen}
                onClose={() => setIsAboutOpen(false)}
              />
            </Suspense>
          )}
        </AnimatePresence>

        <header className="mb-2 md:mb-4 flex justify-between items-center border-b border-gray-800 pb-2 md:pb-4 shrink-0 gap-2">
          <div className="flex items-center gap-4 md:gap-6">
            <button
              aria-label="Go to VimGym home"
              className="cursor-pointer text-left"
              onClick={() => navigate("/")}
              type="button"
            >
              <Logo />
            </button>

            <nav
              aria-label="Game modes"
              className="flex items-center gap-1 rounded-md border border-gray-800 bg-tokyo-night-storm/60 p-0.5"
            >
              <button
                aria-current={route === "/" ? "page" : undefined}
                className={cn(
                  "cursor-pointer px-2.5 py-1 rounded text-xs font-roboto-mono uppercase tracking-wider transition-colors",
                  route === "/"
                    ? "bg-tokyo-night text-white border border-gray-700"
                    : "text-gray-400 hover:text-gray-200",
                )}
                data-testid="nav-gym"
                onClick={() => navigate("/")}
                type="button"
              >
                Gym
              </button>
              <button
                aria-current={route === "/daily" ? "page" : undefined}
                className={cn(
                  "cursor-pointer px-2.5 py-1 rounded text-xs font-roboto-mono uppercase tracking-wider transition-colors flex items-center gap-1.5",
                  route === "/daily"
                    ? "bg-tokyo-night text-tokyo-night-pink border border-tokyo-night-pink/40"
                    : "text-gray-400 hover:text-tokyo-night-pink",
                )}
                data-testid="nav-daily"
                onClick={() => navigate("/daily")}
                type="button"
              >
                <span>Vimdle</span>
                {!isDailyFinished && (
                  <>
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full bg-tokyo-night-pink animate-pulse"
                      data-testid="daily-unplayed-dot"
                    />
                    <span className="sr-only">unplayed</span>
                  </>
                )}
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-1">
            {route === "/daily" &&
              dailyUserStats &&
              dailyUserStats.current_streak > 0 && (
                <span
                  className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-roboto-mono text-tokyo-night-gold"
                  data-testid="header-streak-badge"
                  title="Current daily streak"
                >
                  🔥 {dailyUserStats.current_streak}
                </span>
              )}
            {route === "/daily" && (
              <button
                className="cursor-pointer p-2 text-xs text-gray-400 hover:text-tokyo-night-pink transition-colors font-roboto-mono uppercase tracking-wider"
                data-testid="daily-rules-button"
                onClick={handleOpenDailyHelp}
                type="button"
              >
                Rules
              </button>
            )}
            <button
              className="cursor-pointer p-2 text-xs text-gray-400 hover:text-tokyo-night-pink transition-colors font-roboto-mono uppercase tracking-wider relative before:absolute before:-inset-2 before:content-['']"
              onClick={() => setIsAboutOpen(true)}
              type="button"
            >
              About
            </button>
            <a
              aria-label="GitHub repository"
              className="p-2 text-gray-400 hover:text-tokyo-night-pink transition-colors"
              href="https://github.com/oller/vimgym"
              rel="noopener noreferrer"
              target="_blank"
            >
              <GitHubIcon className="w-4 h-4" />
            </a>
          </div>
        </header>

        {route === "/daily" ? (
          <Suspense
            fallback={
              <div className="flex-1 bg-tokyo-night-storm rounded-md animate-pulse border border-gray-800" />
            }
          >
            <DailyPage
              isHelpOpen={isDailyHelpOpen}
              onCloseHelp={handleCloseDailyHelp}
              onOpenHelp={handleOpenDailyHelp}
            />
          </Suspense>
        ) : (
          <ClassicGymView />
        )}
      </div>
    </CrtEffect>
  );
};

export default Home;
