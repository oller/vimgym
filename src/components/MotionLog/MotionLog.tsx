import { useMemo } from "react";
import { useScrollIntoView } from "../../hooks/useScrollIntoView";
import { useGameStore } from "../../store/useGameStore";
import { explainSequence } from "../../utils/vimsplain";
import { MotionLogItem } from "./MotionLogItem";

export const MotionLog = () => {
  const history = useGameStore((state) => state.history);

  const scrollRef = useScrollIntoView<HTMLDivElement>(history.length, {
    behavior: "smooth",
    block: "end",
  });

  // Join history into a string and explain it
  const explainedCommands = useMemo(() => {
    if (history.length === 0) return [];
    const sequence = history.join("");
    const result = explainSequence(sequence);
    return result.commands;
  }, [history]);

  return (
    <div className="flex flex-col rounded-lg border border-gray-800 p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Motion Log
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin font-roboto-mono text-sm space-y-1 max-h-30">
        {history.length === 0 && (
          <span className="text-gray-600">Start typing...</span>
        )}
        <div className="flex flex-wrap gap-2 items-center">
          {explainedCommands.map((cmd, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Index is stable for append-only log and required for morphing animation
            <MotionLogItem command={cmd} key={index} />
          ))}
        </div>
        {/* Dummy element to scroll into view - moved outside flex container to ensure it's at the very bottom */}
        <div className="size-0" ref={scrollRef} />
      </div>
    </div>
  );
};
