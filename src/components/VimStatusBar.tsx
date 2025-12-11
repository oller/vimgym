interface VimStatusBarProps {
  mode: string;
}

export const VimStatusBar = ({ mode }: VimStatusBarProps) => {
  const getModeColor = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "insert":
        return "bg-blue-600";
      case "visual":
        return "bg-orange-600";
      case "replace":
        return "bg-red-600";
      case "normal":
      default:
        return "bg-green-600";
    }
  };

  return (
    <div className="flex items-center bg-gray-800 text-xs font-mono border-t border-gray-700">
      <div
        className={`${getModeColor(mode)} text-white px-3 py-1 font-bold uppercase transition-colors duration-200`}
      >
        {mode}
      </div>
      <div className="px-3 text-gray-400">Vim Mode</div>
    </div>
  );
};
