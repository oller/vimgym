import { useState } from "react";
import { useLevelScoreDistribution } from "../../hooks/api";
import { Sparkline } from "../Sparkline/Sparkline";
import { useLevelSelectorItem } from "./LevelSelectorItemContext";

export const LevelSelectorItemStats = () => {
  const {
    level,
    levelData: score,
    isStatsOpen,
    setIsStatsOpen,
  } = useLevelSelectorItem();

  const [hoveredPoint, setHoveredPoint] = useState<{
    score: number;
    count: number;
  } | null>(null);

  const { data: distribution } = useLevelScoreDistribution(
    level.id,
    isStatsOpen,
  );

  return (
    <div className="w-1/2 bg-tokyo-night-storm p-3 flex flex-col justify-between">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 space-y-1">
          <div className="text-[10px] text-gray-500">
            LEVEL {level.id} STATS
          </div>
        </div>
        <button
          aria-label="Close stats"
          className="text-gray-500 hover:text-white transition-colors cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setIsStatsOpen(false);
          }}
          type="button"
        >
          <svg
            fill="none"
            height="14"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="14"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Close stats</title>
            <line x1="18" x2="6" y1="6" y2="18" />
            <line x1="6" x2="18" y1="6" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex justify-between items-end gap-2 mt-3">
        <div className="flex flex-col gap-1 min-w-20">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">
            {hoveredPoint ? "Score" : "Avg Score"}
          </span>
          <span className="text-lg font-roboto-mono text-tokyo-night-purple">
            {hoveredPoint ? (
              <span className="flex items-baseline gap-1">
                {hoveredPoint.score}
                <span className="text-[10px] text-gray-500 font-sans">
                  ({hoveredPoint.count}{" "}
                  {hoveredPoint.count === 1 ? "player" : "players"})
                </span>
              </span>
            ) : score?.global.average ? (
              Math.round(score.global.average * 10) / 10
            ) : (
              "-"
            )}
          </span>
        </div>

        <div className="flex-1 h-10 flex items-end justify-end pb-1">
          {distribution && distribution.length > 0 ? (
            <Sparkline
              data={distribution}
              height={40}
              onHover={setHoveredPoint}
              width={140}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-end text-[10px] text-gray-500">
              {distribution ? (
                "No data yet"
              ) : (
                <span className="loading loading-dots loading-xs text-gray-600"></span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
