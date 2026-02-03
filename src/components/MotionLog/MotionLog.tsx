import { useGameStore } from "../../store/useGameStore";
import { MotionLogContext, useMotionLog } from "./MotionLogContext";
import { MotionLogEmptyState } from "./MotionLogEmptyState";
import { MotionLogHeader } from "./MotionLogHeader";
import { MotionLogItem } from "./MotionLogItem";
import { MotionLogList } from "./MotionLogList";
import { MotionLogRoot } from "./MotionLogRoot";

// --- Container (Legacy Support / Smart Component) ---

export const MotionLog = () => {
  const history = useGameStore((state) => state.history);

  return (
    <MotionLogRoot history={history}>
      <MotionLogHeader />
      <MotionLogList>
        <MotionLogEmptyState />
        <div className="flex flex-wrap gap-2 items-center">
          <MotionLogItems />
        </div>
      </MotionLogList>
    </MotionLogRoot>
  );
};

// Internal helper to access context and map items
const MotionLogItems = () => {
  const { commands } = useMotionLog();
  return (
    <>
      {commands.map((cmd, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Index is stable for append-only log and required for morphing animation
        <MotionLogItem command={cmd} key={index} />
      ))}
    </>
  );
};

// --- Compound Export ---

export const MotionLogComposite = Object.assign(MotionLogRoot, {
  Header: MotionLogHeader,
  List: MotionLogList,
  Item: MotionLogItem,
  EmptyState: MotionLogEmptyState,
  Context: MotionLogContext,
});
