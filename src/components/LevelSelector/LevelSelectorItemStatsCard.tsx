import { useState } from "react";
import type { Level } from "../../data/levels";
import { useLevelScoreDistribution } from "../../hooks/api";
import type { PlayerDashboard } from "../../schemas";
import { CloseIcon } from "../icons/CloseIcon";
import { Sparkline } from "../Sparkline/Sparkline";

type LevelSelectorItemStatsCardProps = {
  index: number;
  level: Level;
  score: PlayerDashboard[string] | undefined;
  isStatsOpen: boolean;
  onCloseStats: () => void;
};

export const LevelSelectorItemStatsCard = ({
  index,
  level,
  score,
  isStatsOpen,
  onCloseStats,
}: LevelSelectorItemStatsCardProps) => {
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
          <div className="text-[10px] text-gray-500">LEVEL {index} STATS</div>
        </div>
        <button
          aria-label="Close stats"
          className="text-gray-500 hover:text-white transition-colors cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onCloseStats();
          }}
          type="button"
        >
          <CloseIcon height={14} width={14} />
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
              className="size-full"
              data={distribution}
              onHover={setHoveredPoint}
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
