import { getLevel, LEVELS } from "../../data/levels";
import { useGameStore } from "../../store/useGameStore";

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
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Level {currentLevel} of {LEVELS.length}
          </h3>
          <p className="text-md text-gray-500 mt-1">
            {currentLevelData?.description}
          </p>
        </div>

        <div className="flex gap-4 items-center">
          {/* {bestScore !== undefined && ( */}
          {/*   <output */}
          {/*     aria-label="best score" */}
          {/*     className="text-sm text-yellow-500 font-roboto-mono" */}
          {/*   > */}
          {/*     Your best: {bestScore} keys */}
          {/*     {typeof perfectScore === "number" && */}
          {/*       bestScore <= perfectScore && ( */}
          {/*         <span */}
          {/*           className="ml-2 cursor-help" */}
          {/*           title="This is a perfect score!" */}
          {/*         > */}
          {/*           🏆 */}
          {/*         </span> */}
          {/*       )} */}
          {/*   </output> */}
          {/* )} */}
          <button
            className="cursor-pointer text-xs bg-tokyo-night-storm hover:bg-slate-700/60 text-white px-4 py-2 transition-colors font-roboto-mono uppercase"
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
