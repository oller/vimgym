import { useLevelStats } from "../../hooks/api";

type LevelStatsCardProps = {
  levelId: number;
  userScore?: number;
};

export const LevelStatsCard = ({ levelId }: LevelStatsCardProps) => {
  const { data: stats, isLoading } = useLevelStats();
  const levelStats = stats?.[levelId];

  if (isLoading || !levelStats || levelStats.totalCompletions === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2 w-full">
      <div className="flex justify-between text-[10px] opacity-70 font-medium tracking-wider uppercase">
        <span>Best: {levelStats.bestScore}</span>
        <span>Avg: {Math.round(levelStats.avgKeystrokes)}</span>
      </div>

      {/* {userScore && (
        <PerformanceBar
          avgScore={levelStats.avgKeystrokes}
          bestPossibleScore={levelStats.bestScore}
          userScore={userScore}
        />
      )} */}
    </div>
  );
};
