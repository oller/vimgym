type LevelStatsCardProps = {
  globalAverage: number | null | undefined;
  globalBest: number | null | undefined;
};

export const LevelStatsCard = ({
  globalAverage,
  globalBest,
}: LevelStatsCardProps) => {
  if (!globalAverage || !globalBest) {
    return null;
  }
  return (
    <div className="mt-3 space-y-2 w-full">
      <div className="flex justify-between text-[10px] opacity-70 font-medium tracking-wider uppercase">
        <span>Record: {globalBest}</span>
        <span>Avg: {globalAverage}</span>
      </div>
    </div>
  );
};
