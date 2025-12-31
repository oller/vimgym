import { getLevel, LEVELS } from "../data/levels";
import { useGameStore } from "../store/useGameStore";

export const GoalDisplay = () => {
  const { isCompleted, resetLevel, currentLevel, highScores } = useGameStore();
  const bestScore = highScores[currentLevel];
  const currentLevelData = getLevel(currentLevel);
  const perfectScore = currentLevelData?.perfectScore;

  return (
    <div className="">
      {/* Header with Level Info */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Level {currentLevel} of {LEVELS.length}
          </h3>
          <p className="text-md text-gray-500 mt-1">
            {currentLevelData?.description}
          </p>
        </div>

        <div className="flex gap-4 items-center">
          {bestScore !== undefined && (
            <output
              aria-label="best score"
              className="text-sm text-yellow-500 font-roboto-mono"
            >
              Best: {bestScore} keys
              {typeof perfectScore === "number" &&
                bestScore <= perfectScore && (
                  <span
                    title="This is a perfect score!"
                    className="ml-2 cursor-help"
                  >
                    🏆
                  </span>
                )}
            </output>
          )}
          <button
            type="button"
            onClick={resetLevel}
            className="cursor-pointer text-sm bg-tokyo-night-storm/80 hover:bg-tokyo-night-storm text-white px-4 py-2 rounded transition-colors"
            title={isCompleted ? "Retry Level" : "Reset Level"}
          >
            {isCompleted ? "Retry" : "Reset"}
          </button>
        </div>
      </div>
    </div>
  );
};
