import { useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { GoalDisplay } from "./components/GoalDisplay";
import { LevelSelector } from "./components/LevelSelector";
import { MotionLog } from "./components/MotionLog";
import { VimEditor } from "./components/VimEditor";
import { useGameStore } from "./store/useGameStore";

const Home = () => {
  const { levelId } = useSearch({ from: "/" });
  const setLevel = useGameStore((state) => state.setLevel);
  const resetCount = useGameStore((state) => state.resetCount);

  useEffect(() => {
    setLevel(levelId);
  }, [levelId, setLevel]);
  return (
    <div className="min-h-screen bg-tokyo-night text-white flex flex-col p-4 md:p-8 font-sans">
      {/* <header className="mb-8 flex justify-between items-center border-b border-gray-800 pb-4"> */}
      {/*   <div> */}
      {/*     <h1 className="text-3xl font-bold text-white"> */}
      {/*       VimGym 💪🖥 */}
      {/*       <span className="scale-x-[-1] inline-block">💪</span> */}
      {/*     </h1> */}
      {/*     <p className="text-gray-400 text-sm mt-1"> */}
      {/*       Master Vim motions through practice */}
      {/*     </p> */}
      {/*   </div> */}
      {/* </header> */}

      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Content */}
        <section className="md:col-span-9 lg:col-span-10 flex flex-col gap-6">
          <GoalDisplay />

          <div className="flex flex-col grow">
            <VimEditor key={`${levelId}-${resetCount}`} />
          </div>

          <MotionLog />
        </section>

        {/* Right: Level Selector */}
        <aside className="md:col-span-3 lg:col-span-2 flex">
          <LevelSelector />
        </aside>
      </main>
    </div>
  );
};

export default Home;
