import { useNavigate, useSearch } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

import { CrtEffect } from "./components/CrtEffect";
import { GoalDisplay } from "./components/GoalDisplay/GoalDisplay";
import { LevelSelector } from "./components/LevelSelector/LevelSelector";
import { Logo } from "./components/Logo/Logo";
import { AboutModal } from "./components/Modals/AboutModal";
import { CompletionModal } from "./components/Modals/CompletionModal";
import { MotionLog } from "./components/MotionLog/MotionLog";
import { VimEditor } from "./components/VimEditor/VimEditor";
import { LEVELS } from "./data/levels";
import { useGameStore } from "./store/useGameStore";

const Home = () => {
  const { levelId } = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });
  const setLevel = useGameStore((state) => state.setLevel);
  const resetCount = useGameStore((state) => state.resetCount);
  const isCompleted = useGameStore((state) => state.isCompleted);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Check if there is next level
  const currentLevelId = typeof levelId === "number" ? levelId : 1;
  const hasNextLevel = currentLevelId < LEVELS.length;

  const handleNextLevel = useCallback(() => {
    if (hasNextLevel) {
      navigate({ search: { levelId: currentLevelId + 1 }, replace: true });
    }
  }, [hasNextLevel, currentLevelId, navigate]);

  useEffect(() => {
    setLevel(levelId);
  }, [levelId, setLevel]);

  return (
    <CrtEffect>
      <div className="h-screen overflow-hidden bg-tokyo-night text-white flex flex-col p-4 md:p-6 font-sans relative">
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

        <header className="mb-4 flex justify-between items-center border-b border-gray-800 pb-4">
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
          className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0"
          initial={{ opacity: 0, filter: "blur(10px)" }}
          layout
          transition={{ duration: 0.2, ease: "easeOut", delay: 0.8 }}
        >
          {/* Main Content */}
          <motion.section
            className="md:col-span-9 lg:col-span-10 flex flex-col gap-6 h-full min-h-0"
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
            className="md:col-span-3 lg:col-span-2 flex h-full min-h-0"
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
