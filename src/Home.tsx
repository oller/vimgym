import { useNavigate, useSearch } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

import { GoalDisplay } from "./components/GoalDisplay";
import { LevelSelector } from "./components/LevelSelector";
import { Logo } from "./components/Logo";
import { AboutModal } from "./components/Modals/AboutModal";
import { CompletionModal } from "./components/Modals/CompletionModal";
import { MotionLog } from "./components/MotionLog/MotionLog";
import { VimEditor } from "./components/VimEditor";
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
      navigate({ search: { levelId: currentLevelId + 1 } });
    }
  }, [hasNextLevel, currentLevelId, navigate]);

  useEffect(() => {
    setLevel(levelId);
  }, [levelId, setLevel]);

  return (
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
            onNext={handleNextLevel}
            hasNextLevel={hasNextLevel}
          />
        )}
      </AnimatePresence>

      <header className="mb-4 flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <Logo />
        </div>
        <button
          type="button"
          onClick={() => setIsAboutOpen(true)}
          className="cursor-pointer p-2 text-xs text-gray-500 hover:text-tokyo-night-pink transition-colors font-roboto-mono uppercase tracking-wider"
        >
          About
        </button>
      </header>

      <motion.main
        layout
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.2, ease: "easeOut", delay: 0.8 }}
        className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0"
      >
        {/* Main Content */}
        <motion.section
          layout
          className="md:col-span-9 lg:col-span-10 flex flex-col gap-6 h-full min-h-0"
        >
          <GoalDisplay />

          <div className="flex flex-col grow min-h-0">
            <VimEditor key={`${levelId}-${resetCount}`} />
          </div>

          <motion.div layout className="shrink-0">
            <MotionLog />
          </motion.div>
        </motion.section>

        {/* Right: Level Selector */}
        <motion.aside
          layout
          className="md:col-span-3 lg:col-span-2 flex h-full min-h-0"
        >
          <LevelSelector />
        </motion.aside>
      </motion.main>
    </div>
  );
};

export default Home;
