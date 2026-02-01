import { cn } from "../../utils/cn";

export const VimStatusBar = ({ mode }: { mode: string }) => {
  const getModeColor = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "insert":
        return "bg-tokyo-night-sapphire/70";
      case "visual":
        return "bg-tokyo-night-peach/70";
      case "replace":
        return "bg-tokyo-night-lavender/70";
      default:
        return "bg-tokyo-night-turquoise/70";
    }
  };

  return (
    <div className="flex justify-between items-center bg-tokyo-night text-xs font-roboto-mono">
      <div className="flex items-center">
        <div
          className={cn(
            getModeColor(mode),
            "self-stretch items-center flex text-white px-3 py-1 font-bold uppercase transition-colors duration-200",
          )}
        >
          {mode}
        </div>
        <div className="px-3 text-gray-400">Vim Mode</div>
      </div>
      <div className="px-3 text-gray-400">
        Hint: You can use <kbd className="text-tokyo-night-pink">:e</kbd> to
        reset, <kbd className="text-tokyo-night-pink">:e X</kbd> to jump to
        level X or <kbd className="text-tokyo-night-pink">:q</kbd> to quit 😉.
      </div>
    </div>
  );
};
