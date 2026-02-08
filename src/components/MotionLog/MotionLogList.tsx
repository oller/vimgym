import type { PropsWithChildren } from "react";
import { useScrollIntoView } from "../../hooks/useScrollIntoView";

type MotionLogListProps = PropsWithChildren<{
  count: number;
}>;

export const MotionLogList = ({ children, count }: MotionLogListProps) => {
  // We use the commands length to trigger the scroll
  const scrollRef = useScrollIntoView<HTMLDivElement>(count, {
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
