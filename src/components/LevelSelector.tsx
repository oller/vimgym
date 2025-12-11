import { LEVELS } from "../data/levels";
import { useGameStore } from "../store/useGameStore";

export const LevelSelector = () => {
  const { currentLevel, highScores, setLevel } = useGameStore();

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Levels
      </h3>
      <div className="space-y-2">
        {LEVELS.map((level) => {
          const score = highScores[level.id];
          const isCurrent = level.id === currentLevel;

          return (
            <button
              type="button"
              key={level.id}
              onClick={() => setLevel(level.id)}
              className={`w-full cursor-pointer text-left p-3 rounded transition-all ${
                isCurrent
                  ? "bg-green-600 text-white shadow-lg"
                  : score !== undefined
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                    : "bg-gray-900 hover:bg-gray-800 text-gray-400"
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="font-semibold text-sm">Level {level.id}</div>
                  <div className="text-xs opacity-75 mt-0.5">{level.name}</div>
                </div>
                {score !== undefined && (
                  <div className="text-xs font-mono bg-black/20 px-2 py-1 rounded">
                    {score} keys
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
