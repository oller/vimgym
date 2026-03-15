type MotionLogHeaderProps = {
  onOpenInfo: () => void;
};

export const MotionLogHeader = ({ onOpenInfo }: MotionLogHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-2">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
        Motion Log
      </h2>
      <button
        className="cursor-pointer text-xs text-gray-500 hover:text-tokyo-night-pink transition-colors font-roboto-mono uppercase tracking-wider"
        onClick={onOpenInfo}
        type="button"
      >
        about
      </button>
    </div>
  );
};
