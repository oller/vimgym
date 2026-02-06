import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { CrtEffect } from "./components/CrtEffect";
import { GoalDisplay } from "./components/GoalDisplay/GoalDisplay";
import { LevelSelector } from "./components/LevelSelector/LevelSelector";
import { Logo } from "./components/Logo/Logo";
import { AboutModal } from "./components/Modals/AboutModal";
import { CompletionModal } from "./components/Modals/CompletionModal";
import { MotionLog } from "./components/MotionLog/MotionLog";
import { VimEditor } from "./components/VimEditor/VimEditor";
import { LEVELS } from "./data/levels";
import { useLevelId } from "./hooks/useLevelId";
import { useGameStore } from "./store/useGameStore";

const Home = () => {
  const [levelId, setLevelId] = useLevelId();
  const setLevel = useGameStore((state) => state.setLevel);
  const resetCount = useGameStore((state) => state.resetCount);
  const isCompleted = useGameStore((state) => state.isCompleted);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Validate level exists
  const isValidLevel = LEVELS.some((l) => l.id === levelId);
  const currentLevelId = isValidLevel && levelId ? levelId : 1;
  const hasNextLevel = currentLevelId < LEVELS.length;

  const handleNextLevel = () => {
    if (hasNextLevel) {
      setLevelId(currentLevelId + 1);
    }
  };

  useEffect(() => {
    // If invalid level in URL, redirect to 1
    if (!isValidLevel || !levelId) {
      setLevelId(1);
      return;
    }
    setLevel(currentLevelId);
  }, [currentLevelId, setLevel, isValidLevel, levelId, setLevelId]);

  return (
    <CrtEffect>
      <div className="h-dvh overflow-hidden bg-tokyo-night text-white flex flex-col p-4 md:p-6 font-sans relative">
        <AnimatePresence>
          {isAboutOpen && (
            <AboutModal
              isOpen={isAboutOpen}
              onClose={() => setIsAboutOpen(false)}
            />
          )}
          {isCompleted && (
            <CompletionModal
              hasNextLevel={hasNextLevel}
              onNext={handleNextLevel}
            />
          )}
        </AnimatePresence>

        <header className="mb-2 md:mb-4 flex justify-between items-center border-b border-gray-800 pb-2 md:pb-4">
          <Logo />
          <button
            className="cursor-pointer p-2 text-xs text-gray-500 hover:text-tokyo-night-pink transition-colors font-roboto-mono uppercase tracking-wider"
            onClick={() => setIsAboutOpen(true)}
            type="button"
          >
            About
          </button>
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
              <VimEditor key={`${levelId}-${resetCount}`} />
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
            <LevelSelector />
          </motion.aside>
        </motion.main>
      </div>
    </CrtEffect>
  );
};

export default Home;
