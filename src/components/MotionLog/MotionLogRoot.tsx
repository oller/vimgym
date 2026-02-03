import type { ReactNode } from "react";
import { useMemo } from "react";
import { explainSequence } from "../../utils/vimsplain";
import { MotionLogContext } from "./MotionLogContext";

type MotionLogRootProps = {
  history: string[];
  children: ReactNode;
};

export const MotionLogRoot = ({ history, children }: MotionLogRootProps) => {
  // Join history into a string and explain it
  // Compiler optimizes this automatically
  const commands = useMemo(() => {
    if (history.length === 0) return [];
    const sequence = history.join("");
    const result = explainSequence(sequence);
    return result.commands;
  }, [history]);

  return (
    <MotionLogContext.Provider
      value={{ commands, isEmpty: history.length === 0 }}
    >
      <div className="flex flex-col rounded-lg border border-gray-800 p-4">
        {children}
      </div>
    </MotionLogContext.Provider>
  );
};
