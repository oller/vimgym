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
        "px-1.5 py-0.5 min-w-5 text-xs rounded text-center font-roboto-mono inline-block bg-slate-800/80 border border-slate-700/50 text-tokyo-night-gold shadow-sm",
        className,
      )}
    >
      {formatKeyForDisplay(children)}
    </kbd>
  );
};
