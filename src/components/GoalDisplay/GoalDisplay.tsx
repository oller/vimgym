import { getLevel, LEVELS } from "../../data/levels";
import { useGameStore } from "../../store/useGameStore";

export const GoalDisplay = () => {
  const isCompleted = useGameStore((state) => state.isCompleted);
  const resetLevel = useGameStore((state) => state.resetLevel);
  const currentLevel = useGameStore((state) => state.currentLevel);
  const currentLevelIndex = LEVELS.findIndex((l) => l.id === currentLevel) + 1;
  const currentLevelData = getLevel(currentLevel);

  return (
    <div className="">
      {/* Header with Level Info */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            Level {currentLevelIndex} of {LEVELS.length}
          </h3>
          <p className="text-md text-gray-400 mt-1">
            {currentLevelData?.description}
          </p>
        </div>

        <div className="flex gap-4 items-center">
          <button
            className="cursor-pointer text-xs bg-tokyo-night-storm hover:bg-slate-700/60 text-white px-4 py-2 transition-colors font-roboto-mono uppercase relative before:absolute before:-inset-2 before:content-['']"
            onClick={resetLevel}
            title={isCompleted ? "Retry Level" : "Reset Level"}
            type="button"
          >
            {isCompleted ? "Retry" : "Reset"} Level
          </button>
        </div>
      </div>
    </div>
  );
};
