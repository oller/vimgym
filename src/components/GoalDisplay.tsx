import { useNavigate } from "@tanstack/react-router";
import { getLevel, LEVELS } from "../data/levels";
import { useGameStore } from "../store/useGameStore";

export const GoalDisplay = () => {
  const { isCompleted, resetLevel, currentLevel, highScores, history } =
    useGameStore();
  const navigate = useNavigate({ from: "/" });
  const bestScore = highScores[currentLevel];
  const currentLevelData = getLevel(currentLevel);
  const hasNextLevel = currentLevel < LEVELS.length;
  const perfectScore = currentLevelData?.perfectScore;

  const handleNextLevel = () => {
    navigate({ search: { levelId: currentLevel + 1 } });
  };

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

        <div className="flex gap-2 items-center">
          {bestScore !== undefined && (
            <span
              data-testid="best-score"
              className="text-xs text-yellow-500 font-mono"
            >
              Best: {bestScore} keys
              {typeof perfectScore === "number" &&
                Number.isFinite(perfectScore) &&
                bestScore <= perfectScore && (
                  <span
                    title="This is a perfect score!"
                    className="ml-2 cursor-help"
                  >
                    🏆
                  </span>
                )}
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
                onClick={handleNextLevel}
                className="bg-green-600 curspro-pointer hover:bg-green-500 text-white px-4 py-2 rounded font-semibold transition-colors"
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
