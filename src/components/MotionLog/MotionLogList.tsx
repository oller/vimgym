import type { PropsWithChildren } from "react";
import { useScrollIntoView } from "../../hooks/useScrollIntoView";
import { useMotionLog } from "./MotionLogContext";

export const MotionLogList = ({ children }: PropsWithChildren) => {
  const { commands } = useMotionLog();
  // We use the commands length to trigger the scroll
  const scrollRef = useScrollIntoView<HTMLDivElement>(commands.length, {
    behavior: "smooth",
    block: "end",
  });

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin font-roboto-mono text-sm space-y-1 max-h-30">
      {children}
      {/* Dummy element to scroll into view - moved outside flex container to ensure it's at the very bottom */}
      <div className="size-0" ref={scrollRef} />
    </div>
  );
};
