import { AnimatePresence, motion } from "motion/react";
import { lazy, Suspense, useEffect, useState } from "react";

import { CrtEffect } from "./components/CrtEffect";
import { GoalDisplay } from "./components/GoalDisplay/GoalDisplay";
import { GitHubIcon } from "./components/icons/GitHubIcon";
import { Logo } from "./components/Logo/Logo";
import { MotionLog } from "./components/MotionLog/MotionLog";
import { LEVELS } from "./data/levels";
import { useLevelId } from "./hooks/useLevelId";
import { useGameStore } from "./store/useGameStore";

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

const Home = () => {
  const [levelId, setLevelId] = useLevelId();
  const setLevel = useGameStore((state) => state.setLevel);
  const resetCount = useGameStore((state) => state.resetCount);
  const isCompleted = useGameStore((state) => state.isCompleted);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

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
          {isCompleted && (
            <Suspense fallback={null}>
              <CompletionModal
                hasNextLevel={hasNextLevel}
                onNext={handleNextLevel}
              />
            </Suspense>
          )}
        </AnimatePresence>

        <header className="mb-2 md:mb-4 flex justify-between items-center border-b border-gray-800 pb-2 md:pb-4">
          <Logo />
          <div className="flex items-center gap-1">
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
              <Suspense
                fallback={
                  <div className="grow bg-tokyo-night-storm rounded-md animate-pulse border border-gray-800" />
                }
              >
                <VimEditor key={`${levelId}-${resetCount}`} />
              </Suspense>
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
      </div>
    </CrtEffect>
  );
};

export default Home;
