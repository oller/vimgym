import { getLevel, LEVELS } from "../data/levels";
import { useGameStore } from "../store/useGameStore";

export const GoalDisplay = () => {
  const {
    targetText,
    isCompleted,
    resetLevel,
    currentLevel,
    highScores,
    nextLevel,
    history,
  } = useGameStore();
  const bestScore = highScores[currentLevel];
  const currentLevelData = getLevel(currentLevel);
  const hasNextLevel = currentLevel < LEVELS.length;

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 relative">
      {/* Header with Level Info */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Level {currentLevel} of {LEVELS.length}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {currentLevelData?.description}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {bestScore !== undefined && (
            <span
              data-testid="best-score"
              className="text-xs text-yellow-500 font-mono"
            >
              Best: {bestScore} keys
            </span>
          )}
          <button
            type="button"
            onClick={resetLevel}
            className="cursor-pointer text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded transition-colors"
            title={isCompleted ? "Retry Level" : "Reset Level"}
          >
            {isCompleted ? "Retry" : "Reset"}
          </button>
        </div>
      </div>

      {/* Target Text */}
      <div className="mb-2">
        <h4 className="text-xs text-gray-500 mb-1">Goal:</h4>
        <div
          className={`font-mono text-sm p-3 rounded bg-gray-900 ${isCompleted ? "text-green-400" : "text-gray-200"}`}
        >
          {targetText}
        </div>
      </div>

      {/* Completion Message & Next Level Button */}
      {isCompleted && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between bg-green-900/30 border border-green-700 rounded p-3">
            <div>
              <div
                data-testid="level-complete"
                className="text-green-400 font-bold"
              >
                ✓ Level Complete!
              </div>
              <div
                data-testid="keystroke-count"
                className="text-xs text-green-500 mt-1"
              >
                Completed in {history.length} keystrokes
                {bestScore !== undefined && history.length === bestScore && (
                  <span className="ml-2 text-yellow-500">🏆 New Best!</span>
                )}
              </div>
              {hasNextLevel && (
                <div className="text-xs text-gray-400 mt-1">
                  Press{" "}
                  <kbd className="px-1 py-0.5 bg-gray-700 rounded text-white">
                    Enter
                  </kbd>{" "}
                  to continue
                </div>
              )}
            </div>
            {hasNextLevel && (
              <button
                type="button"
                onClick={nextLevel}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-semibold transition-colors"
              >
                Next Level →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
