import { AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import { explainSequence } from "vimsplain";
import { useGameStore } from "../../store/useGameStore";
import { cn } from "../../utils/cn";
import { MotionLogInfoModal } from "../Modals/MotionLogInfoModal";
import { MotionLogEmptyState } from "./MotionLogEmptyState";
import { MotionLogHeader } from "./MotionLogHeader";
import { MotionLogItem } from "./MotionLogItem";
import { MotionLogList } from "./MotionLogList";

type MotionSequencePillsProps = {
  keystrokes: string[];
  className?: string;
};

export const MotionSequencePills = ({
  keystrokes,
  className,
}: MotionSequencePillsProps) => {
  const commands = useMemo(() => {
    if (keystrokes.length === 0) return [];
    const result = explainSequence(keystrokes.join(""));
    return result.commands;
  }, [keystrokes]);

  if (commands.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-2 items-center", className)}>
      {commands.map((cmd, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Index is stable for append-only log and required for morphing animation
        <MotionLogItem command={cmd} key={index} />
      ))}
    </div>
  );
};

type MotionLogProps = {
  history?: string[];
};

export const MotionLog = ({ history: propHistory }: MotionLogProps) => {
  const storeHistory = useGameStore((state) => state.history);
  const history = propHistory ?? storeHistory;
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const commands = useMemo(() => {
    if (history.length === 0) return [];
    const sequence = history.join("");
    const result = explainSequence(sequence);
    return result.commands;
  }, [history]);

  return (
    <>
      <AnimatePresence>
        {isInfoOpen && (
          <MotionLogInfoModal
            isOpen={isInfoOpen}
            onClose={() => setIsInfoOpen(false)}
          />
        )}
      </AnimatePresence>
      <div className="flex flex-col rounded-lg border border-gray-800 p-4">
        <MotionLogHeader onOpenInfo={() => setIsInfoOpen(true)} />
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
    </>
  );
};
