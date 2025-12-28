import { useEffect, useMemo, useRef } from "react";
import { useGameStore } from "../store/useGameStore";
import { explainSequence } from "../utils/vimsplain";

/** Format a key sequence for display - replace spaces and specials with visible symbols */
const formatKeyForDisplay = (key: string): string => {
  return key
    .replace(/ /g, "␣")
    .replace(/\[Up\]/g, "↑")
    .replace(/\[Down\]/g, "↓")
    .replace(/\[Left\]/g, "←")
    .replace(/\[Right\]/g, "→")
    .replace(/\[Enter\]/g, "↵")
    .replace(/\[Esc\]/g, "Esc")
    .replace(/\[Backspace\]/g, "⌫");
};

export const MotionLog = () => {
  const { history } = useGameStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Join history into a string and explain it
  const explainedCommands = useMemo(() => {
    if (history.length === 0) return [];
    const sequence = history.join("");
    const result = explainSequence(sequence);
    return result.commands;
  }, [history]);

  // Auto-scroll to bottom when number of commands changes
  useEffect(() => {
    if (scrollContainerRef.current && history.length > 0) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [history.length]);

  return (
    <div className="flex flex-col bg-tokyo-night-storm rounded-lg border border-gray-800 p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Motion Log
        </h3>
        <span className="text-sm font-mono text-yellow-500">
          {history.length} keys
        </span>
      </div>
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto font-roboto-mono text-sm space-y-1 max-h-30"
      >
        {history.length === 0 && (
          <span className="text-gray-600">Start typing...</span>
        )}
        <div className="flex flex-wrap gap-2 items-center">
          {explainedCommands.map((cmd, index) => (
            <div
              key={`${index}-${cmd.matched}`}
              className="flex items-center gap-1 bg-gray-800/50 rounded border border-gray-800"
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
