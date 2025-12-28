import { useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AboutModal } from "./components/AboutModal";
import { GoalDisplay } from "./components/GoalDisplay";
import { LevelSelector } from "./components/LevelSelector";
import { MotionLog } from "./components/MotionLog";
import { VimEditor } from "./components/VimEditor";
import { useGameStore } from "./store/useGameStore";

const Home = () => {
  const { levelId } = useSearch({ from: "/" });
  const setLevel = useGameStore((state) => state.setLevel);
  const resetCount = useGameStore((state) => state.resetCount);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  useEffect(() => {
    setLevel(levelId);
  }, [levelId, setLevel]);
  return (
    <div className="h-screen overflow-hidden bg-tokyo-night text-white flex flex-col p-4 md:p-6 font-sans">
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <header className="mb-4 flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-xl text-gray-400 font-roboto-mono flex items-center">
            <span className="animate-vim-blink px-[1px]">V</span>
            <span className="tracking-wider">imGym</span>
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setIsAboutOpen(true)}
          className="cursor-pointer text-sm text-gray-500 hover:text-gray-300 transition-colors font-roboto-mono"
        >
          about
        </button>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">
        {/* Main Content */}
        <section className="md:col-span-9 lg:col-span-10 flex flex-col gap-6 h-full min-h-0">
          <GoalDisplay />

          <div className="flex flex-col grow min-h-0">
            <VimEditor key={`${levelId}-${resetCount}`} />
          </div>

          <div className="shrink-0">
            <MotionLog />
          </div>
        </section>

        {/* Right: Level Selector */}
        <aside className="md:col-span-3 lg:col-span-2 flex h-full min-h-0">
          <LevelSelector />
        </aside>
      </main>
    </div>
  );
};

export default Home;
