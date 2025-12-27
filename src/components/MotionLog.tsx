import { useMemo } from "react";
import { useGameStore } from "../store/useGameStore";
import { explainSequence } from "../utils/vimsplain";

/** Format a key sequence for display - replace spaces with visible symbol */
const formatKeyForDisplay = (key: string): string => {
  return key.replace(/ /g, "␣");
};

export const MotionLog = () => {
  const { history } = useGameStore();

  // Join history into a string and explain it
  const explainedCommands = useMemo(() => {
    if (history.length === 0) return [];
    const sequence = history.join("");
    const result = explainSequence(sequence);
    return result.commands;
  }, [history]);

  return (
    <div className="flex flex-col bg-tokyo-night-storm rounded-lg border border-gray-700 p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Motion Log
        </h3>
        <span className="text-sm font-mono text-yellow-500">
          {history.length} keys
        </span>
      </div>
      <div className="flex-1 overflow-y-auto font-roboto-mono text-sm space-y-1">
        {history.length === 0 && (
          <span className="text-gray-600">Start typing...</span>
        )}
        <div className="flex flex-wrap gap-2 items-center">
          {explainedCommands.map((cmd, index) => (
            <div
              key={`${index}-${cmd.matched}`}
              className="flex items-center gap-1 bg-gray-800/50 rounded px-2 py-1 border border-gray-700"
            >
              <kbd className="px-1.5 py-0.5 bg-gray-900 rounded text-yellow-500 font-bold">
                {formatKeyForDisplay(cmd.matched)}
              </kbd>
              <span className="text-gray-400 text-xs">{cmd.explanation}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
