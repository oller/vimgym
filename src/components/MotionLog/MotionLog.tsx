import { useMemo } from "react";
import { explainSequence } from "vimsplain";
import { useGameStore } from "../../store/useGameStore";
import { MotionLogEmptyState } from "./MotionLogEmptyState";
import { MotionLogHeader } from "./MotionLogHeader";
import { MotionLogItem } from "./MotionLogItem";
import { MotionLogList } from "./MotionLogList";

export const MotionLog = () => {
  const history = useGameStore((state) => state.history);

  const commands = useMemo(() => {
    if (history.length === 0) return [];
    const sequence = history.join("");
    const result = explainSequence(sequence);
    return result.commands;
  }, [history]);

  return (
    <div className="flex flex-col rounded-lg border border-gray-800 p-4">
      <MotionLogHeader />
      <MotionLogList count={commands.length}>
        {history.length === 0 && <MotionLogEmptyState />}
        <div className="flex flex-wrap gap-2 items-center">
          {commands.map((cmd, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Index is stable for append-only log and required for morphing animation
            <MotionLogItem command={cmd} key={index} />
          ))}
        </div>
      </MotionLogList>
    </div>
  );
};
