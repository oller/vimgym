import { useGameStore } from "../store/useGameStore";

export const MotionLog = () => {
  const { history } = useGameStore();

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg border border-gray-700 p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Motion Log
        </h3>
        <span className="text-sm font-mono text-yellow-400">
          {history.length} keys
        </span>
      </div>
      <div className="flex-1 overflow-y-auto font-mono text-sm space-y-1">
        {history.length === 0 && (
          <span className="text-gray-600 italic">Start typing...</span>
        )}
        <div className="flex flex-wrap gap-2">
          {history.map((key, index) => (
            <span
              key={`${index}-${key}`}
              className="px-2 py-1 bg-gray-800 rounded border border-gray-700 text-yellow-400 min-w-[1.5rem] text-center"
            >
              {key}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
