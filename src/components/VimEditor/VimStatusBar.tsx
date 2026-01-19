import { cn } from "../../utils/cn";

export const VimStatusBar = ({ mode }: { mode: string }) => {
  const getModeColor = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "insert":
        return "bg-blue-600";
      case "visual":
        return "bg-orange-600";
      case "replace":
        return "bg-red-600";
      default:
        return "bg-green-600";
    }
  };

  return (
    <div className="flex justify-between items-center bg-tokyo-night text-xs font-roboto-mono">
      <div className="flex items-center">
        <div
          className={cn(
            getModeColor(mode),
            "text-white px-3 py-1 font-bold uppercase transition-colors duration-200",
          )}
        >
          {mode}
        </div>
        <div className="px-3 text-gray-400">Vim Mode</div>
      </div>
      <div className="px-3 text-gray-400">
        Hint: You can use <kbd className="text-tokyo-night-pink">:e</kbd> to
        reset, <kbd className="text-tokyo-night-pink">:e X</kbd> to jump to
        level X or <kbd className="text-tokyo-night-pink">:q</kbd> to quit.
      </div>
    </div>
  );
};
