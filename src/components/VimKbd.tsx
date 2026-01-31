import { cn } from "../utils/cn";
import { formatKeyForDisplay } from "../utils/keyboard";

type VimKbdProps = {
  children: string;
  className?: string;
};

export const VimKbd = ({ children, className }: VimKbdProps) => {
  return (
    <kbd
      className={cn(
        "px-1.5 py-0.5 bg-slate-800/80 rounded text-yellow-500 min-w-5 text-center font-roboto-mono text-xs border border-slate-700/50",
        className,
      )}
    >
      {formatKeyForDisplay(children)}
    </kbd>
  );
};
